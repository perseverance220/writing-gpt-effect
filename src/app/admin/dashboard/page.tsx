'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Users,
  CheckCircle,
  Clock,
  BarChart3,
  LogOut,
  ChevronDown,
  ChevronUp,
  Download
} from 'lucide-react';

interface ParticipantData {
  id: string;
  identifier: string;
  group: string;
  group_assignment?: string;
  status: string;
  created_at: string;
  completed_at: string | null;
  consent: any;
  demographics: any;
  preTest: any;
  midTest: any;
  postTest: any;
  writingTasks: any[];
  qualitative: any;
  payment_method: string | null;
  payment_info: string | null;
  interview_willing: boolean | null;
  interview_contact: string | null;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [participants, setParticipants] = useState<ParticipantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (!isLoggedIn) {
      router.push('/admin');
      return;
    }

    fetchParticipants();
  }, [router]);

  const fetchParticipants = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/participants', {
        headers: {
          'authorization': 'admin:admin0209',
        },
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || '데이터를 불러오는데 실패했습니다.');
        return;
      }

      setParticipants(data.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('서버 연결에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    router.push('/admin');
  };

  const toggleExpandRow = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  const downloadCSV = () => {
    // Simple CSV export
    const headers = [
      'Identifier',
      'Group',
      'Status',
      'Created At',
      'Completed At',
      'Age',
      'Education',
      'Marital Status',
      'Living Arrangement',
      'Pre-SCS Total',
      'Pre-PANAS Positive',
      'Pre-PANAS Negative',
      'Pre-GAS Total',
      'Mid-PANAS Positive',
      'Mid-PANAS Negative',
      'Post-SCS Total',
      'Post-PANAS Positive',
      'Post-PANAS Negative',
      'Post-GAS Total',
      'Interview Willing',
      'Payment Method',
    ];

    const rows = participants.map(p => [
      p.identifier,
      p.group_assignment || p.group,
      p.status,
      new Date(p.created_at).toLocaleString('ko-KR'),
      p.completed_at ? new Date(p.completed_at).toLocaleString('ko-KR') : '',
      p.demographics?.age || '',
      p.demographics?.education_level || '',
      p.demographics?.marital_status || '',
      p.demographics?.living_arrangement || '',
      p.preTest?.scs_total || '',
      p.preTest?.panas_positive || '',
      p.preTest?.panas_negative || '',
      p.preTest?.gas_total || '',
      p.midTest?.panas_positive || '',
      p.midTest?.panas_negative || '',
      p.postTest?.scs_total || '',
      p.postTest?.panas_positive || '',
      p.postTest?.panas_negative || '',
      p.postTest?.gas_total || '',
      p.interview_willing ? 'Yes' : 'No',
      p.payment_method || '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `participants_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  // Calculate statistics
  const stats = {
    total: participants.length,
    completed: participants.filter(p => p.status === 'completed').length,
    inProgress: participants.filter(p => p.status === 'in_progress').length,
    groupA: participants.filter(p => p.group === 'A').length,
    groupB: participants.filter(p => p.group === 'B').length,
    groupC: participants.filter(p => p.group === 'C').length,
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-secondary/20 to-background">
        <Card className="p-8">
          <p className="text-lg">데이터를 불러오는 중...</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">관리자 대시보드</h1>
            <p className="text-muted-foreground">자기자비 글쓰기 연구 참여자 관리</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={downloadCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              CSV 다운로드
            </Button>
            <Button onClick={handleLogout} variant="outline" className="gap-2">
              <LogOut className="w-4 h-4" />
              로그아웃
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-5 border-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">총 참여자</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">완료</p>
                <p className="text-2xl font-bold">{stats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">진행 중</p>
                <p className="text-2xl font-bold">{stats.inProgress}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 border-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">그룹별</p>
                <p className="text-lg font-bold">
                  A:{stats.groupA} B:{stats.groupB} C:{stats.groupC}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Participants Table */}
        <Card className="border-2 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b-2">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-bold">참여 코드</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">그룹</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">상태</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">시작 시간</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">완료 시간</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">인터뷰</th>
                  <th className="px-4 py-3 text-left text-sm font-bold">상세</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <React.Fragment key={participant.id}>
                    <tr className="border-b hover:bg-secondary/20">
                      <td className="px-4 py-3 font-mono text-sm">{participant.identifier}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          participant.group === 'A' ? 'bg-blue-100 text-blue-700' :
                          participant.group === 'B' ? 'bg-green-100 text-green-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {participant.group}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          participant.status === 'completed' ? 'bg-green-100 text-green-700' :
                          'bg-orange-100 text-orange-700'
                        }`}>
                          {participant.status === 'completed' ? '완료' : '진행중'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {new Date(participant.created_at).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {participant.completed_at ?
                          new Date(participant.completed_at).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {participant.interview_willing ? (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">
                            의향 있음
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => toggleExpandRow(participant.id)}
                          className="gap-1"
                        >
                          {expandedRow === participant.id ? (
                            <><ChevronUp className="w-4 h-4" /> 닫기</>
                          ) : (
                            <><ChevronDown className="w-4 h-4" /> 보기</>
                          )}
                        </Button>
                      </td>
                    </tr>

                    {expandedRow === participant.id && (
                      <tr>
                        <td colSpan={7} className="bg-secondary/30 p-6">
                          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Demographics */}
                            {participant.demographics && (
                              <Card className="p-4 border">
                                <h3 className="font-bold mb-3 text-lg">인구통계</h3>
                                <div className="space-y-2 text-sm">
                                  <p><strong>나이:</strong> {participant.demographics.age}</p>
                                  <p><strong>학력:</strong> {participant.demographics.education_level}</p>
                                  <p><strong>결혼:</strong> {participant.demographics.marital_status}</p>
                                  <p><strong>거주:</strong> {participant.demographics.living_arrangement}</p>
                                  <p><strong>주요 스트레스:</strong> {participant.demographics.main_stressor}</p>
                                </div>
                              </Card>
                            )}

                            {/* Pre-Test Scores */}
                            {participant.preTest && (
                              <Card className="p-4 border">
                                <h3 className="font-bold mb-3 text-lg">사전 검사 점수</h3>
                                <div className="space-y-2 text-sm">
                                  <p><strong>SCS 총점:</strong> {participant.preTest.scs_total}</p>
                                  <p><strong>PANAS 긍정:</strong> {participant.preTest.panas_positive}</p>
                                  <p><strong>PANAS 부정:</strong> {participant.preTest.panas_negative}</p>
                                  <p><strong>GAS 총점:</strong> {participant.preTest.gas_total}</p>
                                </div>
                              </Card>
                            )}

                            {/* Mid-Test Scores */}
                            {participant.midTest && (participant.midTest.panas_positive !== null || participant.midTest.panas_negative !== null) && (
                              <Card className="p-4 border">
                                <h3 className="font-bold mb-3 text-lg">중간 검사 점수</h3>
                                <div className="space-y-2 text-sm">
                                  <p><strong>PANAS 긍정:</strong> {participant.midTest.panas_positive ?? 'N/A'}</p>
                                  <p><strong>PANAS 부정:</strong> {participant.midTest.panas_negative ?? 'N/A'}</p>
                                </div>
                              </Card>
                            )}

                            {/* Post-Test Scores */}
                            {participant.postTest && (
                              <Card className="p-4 border">
                                <h3 className="font-bold mb-3 text-lg">사후 검사 점수</h3>
                                <div className="space-y-2 text-sm">
                                  <p><strong>SCS 총점:</strong> {participant.postTest.scs_total}</p>
                                  <p><strong>PANAS 긍정:</strong> {participant.postTest.panas_positive}</p>
                                  <p><strong>PANAS 부정:</strong> {participant.postTest.panas_negative}</p>
                                  <p><strong>GAS 총점:</strong> {participant.postTest.gas_total}</p>
                                </div>
                              </Card>
                            )}

                            {/* Writing Tasks */}
                            {participant.writingTasks && participant.writingTasks.length > 0 && (
                              <Card className="p-4 border lg:col-span-2">
                                <h3 className="font-bold mb-3 text-lg">글쓰기 과제 ({participant.writingTasks.length}개)</h3>
                                <div className="space-y-4">
                                  {participant.writingTasks.map((task, idx) => (
                                    <div key={idx} className="border-l-4 border-primary pl-4 pb-3 border-b last:border-b-0">
                                      <div className="flex justify-between items-start mb-2">
                                        <p className="text-sm font-bold">
                                          {task.task_type === 'negative_event' ? '🔴 부정적 경험 회상' :
                                           task.task_type === 'common_humanity' ? '🌍 공통인류성' :
                                           task.task_type === 'self_kindness' ? '💚 자기친절' :
                                           task.task_type === 'mindfulness' ? '🧘 마음챙김' :
                                           task.task_type === 'neutral' ? '📝 중립 글쓰기' : task.task_type}
                                        </p>
                                        <div className="flex gap-3 text-xs text-muted-foreground">
                                          <span>{task.word_count || 0}단어</span>
                                          <span>{task.duration_seconds || 0}초</span>
                                        </div>
                                      </div>
                                      <p className="text-sm text-muted-foreground whitespace-pre-wrap mb-2">
                                        {task.content}
                                      </p>
                                      {task.gpt_feedback && (
                                        <div className="mt-3 bg-blue-50 rounded-lg p-4 border border-blue-200">
                                          <div className="text-sm font-bold text-blue-700 flex items-center gap-2 mb-3">
                                            🤖 GPT-5-mini 피드백
                                            {task.gpt_tokens && (
                                              <span className="text-xs font-normal text-muted-foreground">
                                                ({task.gpt_tokens} tokens, {task.gpt_response_time}ms)
                                              </span>
                                            )}
                                          </div>
                                          <p className="text-sm text-foreground pl-3 border-l-2 border-blue-400 whitespace-pre-wrap">
                                            {task.gpt_feedback}
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </Card>
                            )}

                            {/* Qualitative Responses */}
                            {participant.qualitative && (
                              <Card className="p-4 border lg:col-span-2">
                                <h3 className="font-bold mb-3 text-lg">서술형 응답</h3>
                                <div className="space-y-3 text-sm">
                                  {participant.qualitative.q1 && (
                                    <div>
                                      <p className="font-bold mb-1">Q1. 부정적 경험:</p>
                                      <p className="text-muted-foreground">{participant.qualitative.q1}</p>
                                    </div>
                                  )}
                                  {participant.qualitative.q2 && (
                                    <div>
                                      <p className="font-bold mb-1">Q2. 글쓰기 경험:</p>
                                      <p className="text-muted-foreground">{participant.qualitative.q2}</p>
                                    </div>
                                  )}
                                  {participant.qualitative.q3 && (
                                    <div>
                                      <p className="font-bold mb-1">Q3. 불안/스트레스 변화:</p>
                                      <p className="text-muted-foreground">{participant.qualitative.q3}</p>
                                    </div>
                                  )}
                                  {participant.qualitative.q4 && (
                                    <div>
                                      <p className="font-bold mb-1">Q4. 자기 돌봄:</p>
                                      <p className="text-muted-foreground">{participant.qualitative.q4}</p>
                                    </div>
                                  )}
                                  {participant.qualitative.q5 && (
                                    <div>
                                      <p className="font-bold mb-1">Q5. 온라인 프로그램:</p>
                                      <p className="text-muted-foreground">{participant.qualitative.q5}</p>
                                    </div>
                                  )}
                                  {participant.qualitative.q6 && (
                                    <div>
                                      <p className="font-bold mb-1">Q6. 일상생활 변화:</p>
                                      <p className="text-muted-foreground">{participant.qualitative.q6}</p>
                                    </div>
                                  )}
                                </div>
                              </Card>
                            )}

                            {/* Payment & Interview */}
                            <Card className="p-4 border lg:col-span-2">
                              <h3 className="font-bold mb-3 text-lg">사례비 및 인터뷰</h3>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                  <p><strong>인터뷰 의향:</strong> {participant.interview_willing ? '있음' : '없음'}</p>
                                  {participant.interview_contact && (
                                    <p><strong>연락처:</strong> {participant.interview_contact}</p>
                                  )}
                                </div>
                                <div>
                                  <p><strong>지급 방법:</strong> {participant.payment_method || '-'}</p>
                                  {participant.payment_info && (
                                    <p><strong>계좌 정보:</strong> {participant.payment_info.replace(/\|/g, ' | ')}</p>
                                  )}
                                </div>
                              </div>
                            </Card>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {participants.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>아직 참여자가 없습니다.</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
