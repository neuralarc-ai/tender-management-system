import Link from 'next/link';
import { RiBuilding2Line, RiShieldCheckLine, RiArrowRightLine, RiCheckLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            System Operational
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
            Tender Management <br/>
            <span className="text-white">Reimagined</span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl">
            AI-assisted tender intake and proposal submission system featuring real-time synchronization and automated analysis.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/client">
              <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 h-14 text-lg">
                <RiBuilding2Line className="mr-2 h-5 w-5" />
                Access Client Portal
              </Button>
            </Link>
            
            <Link href="/admin">
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 text-lg border-slate-600 text-slate-200 hover:bg-slate-800 hover:text-white">
                <RiShieldCheckLine className="mr-2 h-5 w-5" />
                Access Admin Portal
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <FeatureCard 
            title="Smart Intake"
            description="Streamlined tender submission with automated validation and document handling."
            icon={<RiBuilding2Line className="h-8 w-8 text-blue-400" />}
          />
          <FeatureCard 
            title="AI Analysis"
            description="Instant feasibility scoring and gap analysis powered by advanced algorithms."
            icon={<RiShieldCheckLine className="h-8 w-8 text-purple-400" />}
          />
          <FeatureCard 
            title="Auto-Proposals"
            description="Generate comprehensive proposal drafts in seconds based on tender requirements."
            icon={<RiCheckLine className="h-8 w-8 text-green-400" />}
          />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string, description: string, icon: React.ReactNode }) {
  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardContent className="p-6">
        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg w-fit">
          {icon}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-slate-400 leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

