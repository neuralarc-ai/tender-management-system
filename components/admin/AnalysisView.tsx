import { AIAnalysis } from '@/types';
import { RiBrainLine, RiPieChartLine, RiCheckLine, RiAlertLine, RiCloseLine, RiShieldCheckLine, RiInformationLine } from 'react-icons/ri';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function AnalysisView({ analysis }: { analysis: AIAnalysis }) {
  if (analysis.status === 'pending') {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
        <RiBrainLine className="w-16 h-16 mx-auto text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Analysis Pending</h3>
        <p className="text-blue-700">The system will automatically analyze this tender shortly.</p>
      </div>
    );
  }

  if (analysis.status === 'analyzing') {
    return (
      <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-8 text-center">
        <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Analyzing Requirements...</h3>
        <p className="text-blue-700">Please wait while our AI engine processes the tender documents.</p>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Scores */}
      <div className="grid grid-cols-3 gap-4">
        <ScoreCard label="Relevance Score" score={analysis.relevanceScore} color={getScoreColor(analysis.relevanceScore)} />
        <ScoreCard label="Feasibility Score" score={analysis.feasibilityScore} color={getScoreColor(analysis.feasibilityScore)} />
        <ScoreCard label="Overall Score" score={analysis.overallScore} color={getScoreColor(analysis.overallScore)} />
      </div>

      {/* Delivery Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <RiPieChartLine /> Delivery Capability Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <DeliveryBar label="Fully Deliverable" value={analysis.canDeliver} color="bg-green-500" icon={<RiCheckLine />} />
            <DeliveryBar label="Partially Deliverable" value={analysis.partialDeliver} color="bg-amber-500" icon={<RiAlertLine />} />
            <DeliveryBar label="Out of Scope" value={analysis.outOfScope} color="bg-red-500" icon={<RiCloseLine />} />
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InsightCard title="Identified Gaps" items={analysis.gaps} icon={<RiAlertLine />} color="text-red-600" />
        <InsightCard title="Potential Risks" items={analysis.risks} icon={<RiShieldCheckLine />} color="text-amber-600" />
        <InsightCard title="Key Assumptions" items={analysis.assumptions} icon={<RiInformationLine />} color="text-blue-600" />
      </div>

      <div className="text-xs text-gray-500 text-center">
        Analysis completed at {new Date(analysis.completedAt!).toLocaleString()}
      </div>
    </div>
  );
}

function ScoreCard({ label, score, color }: { label: string, score: number, color: string }) {
  return (
    <Card className="text-center py-6">
      <div className="text-xs font-semibold text-gray-500 uppercase mb-2">{label}</div>
      <div className={`text-4xl font-bold ${color}`}>{score}%</div>
    </Card>
  );
}

function DeliveryBar({ label, value, color, icon }: { label: string, value: number, color: string, icon: React.ReactNode }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center gap-2 font-medium mb-3 text-sm text-gray-700">
        {icon} {label}
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
        <div className={`h-full ${color}`} style={{ width: `${value}%` }} />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}%</div>
    </div>
  );
}

function InsightCard({ title, items, icon, color }: { title: string, items: string[], icon: React.ReactNode, color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <h4 className={`flex items-center gap-2 font-semibold mb-3 ${color}`}>
          {icon} {title}
        </h4>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-gray-600 border-b last:border-0 pb-2 border-gray-100">
              {item}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}


