'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RiCheckLine, RiVipCrownLine } from 'react-icons/ri';

export function PlansView() {
    return (
        <div className="space-y-6 animate-in fade-in duration-300">
             <div>
               <h2 className="text-3xl font-bold text-neural">Subscription Plans</h2>
               <p className="text-gray-500">Choose the right plan for your organization</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                
                {/* Basic Plan */}
                <Card className="p-8 rounded-[32px] border-none shadow-sm bg-white flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="mb-6">
                        <h3 className="text-xl font-medium text-neural">Recruit Basic</h3>
                        <p className="text-sm text-gray-500 mt-2">Essential tools for small teams</p>
                    </div>
                    
                    <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-neural">$17</span>
                            <span className="text-gray-500">/month</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">$228 billed yearly</p>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                        <FeatureItem text="5 Active Tenders" />
                        <FeatureItem text="Basic AI Analysis" />
                        <FeatureItem text="Email Support" />
                    </div>

                    <Button variant="outline" className="w-full rounded-full border-gray-200 hover:bg-gray-50 h-12">
                        Get Started
                    </Button>
                </Card>

                {/* Pro Plan (Dark) */}
                <Card className="p-8 rounded-[32px] border-none shadow-xl bg-neural text-white flex flex-col relative overflow-hidden transform scale-105 z-10">
                    <div className="absolute top-0 right-0 bg-aurora text-neural text-xs font-bold px-4 py-1 rounded-bl-xl">
                        Best Deal
                    </div>
                    
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                            <RiVipCrownLine className="text-aurora" />
                            <h3 className="text-xl font-medium text-white">Talent Pro</h3>
                        </div>
                        <p className="text-gray-400 text-sm">Advanced AI for growing agencies</p>
                    </div>
                    
                    <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white">$26</span>
                            <span className="text-xl text-gray-500 line-through">$49</span>
                            <span className="text-gray-400">/month</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">$228 billed yearly</p>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                        <FeatureItem text="Unlimited Tenders" light />
                        <FeatureItem text="Advanced AI Scoring" light />
                        <FeatureItem text="Priority Support" light />
                        <FeatureItem text="Export to PDF/Excel" light />
                    </div>

                    <Button className="w-full rounded-full bg-aurora text-neural hover:bg-aurora-light h-12 font-semibold">
                        Upgrade Now
                    </Button>
                </Card>

                 {/* Enterprise Plan */}
                 <Card className="p-8 rounded-[32px] border-none shadow-sm bg-white flex flex-col relative overflow-hidden group hover:shadow-md transition-all">
                    <div className="mb-6">
                        <h3 className="text-xl font-medium text-neural">HR Master</h3>
                        <p className="text-sm text-gray-500 mt-2">Custom solutions for enterprises</p>
                    </div>
                    
                    <div className="mb-8">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-neural">$34</span>
                            <span className="text-gray-500">/month</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">$408 billed yearly</p>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                        <FeatureItem text="Dedicated Account Manager" />
                        <FeatureItem text="Custom AI Models" />
                        <FeatureItem text="API Access" />
                        <FeatureItem text="SSO Integration" />
                    </div>

                    <Button variant="outline" className="w-full rounded-full border-gray-200 hover:bg-gray-50 h-12">
                        Contact Sales
                    </Button>
                </Card>
            </div>
        </div>
    );
}

function FeatureItem({ text, light = false }: { text: string, light?: boolean }) {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${light ? 'bg-gray-700 text-aurora' : 'bg-gray-100 text-neural'}`}>
                <RiCheckLine size={12} />
            </div>
            <span className={`text-sm ${light ? 'text-gray-300' : 'text-gray-600'}`}>{text}</span>
        </div>
    )
}


