import { ArrowRight, ArrowUpRight, ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react'
import PackageDetails from './package-details';

interface PricingPlan {
    name: string;
    price: string;
    yearlyPrice: string;
    period: string;
    features: { cat: string; feature: string[] }[];
    description: string;
    buttonText: string;
    href: string;
    isPopular: boolean;
    isCustom?: boolean;
}

export default function List({ plans }: { plans: PricingPlan }) {
    const [showDetailsDialog, setShowDetailsDialog] = React.useState(false);
    const limit = 1;

    return (
        <div className="space-y-4">
            {plans.features.slice(0, limit).map((feature, idx) => (
                <div key={idx} className="space-y-2">
                    <h4 className="text-sm font-bold text-foreground border-b pb-1">
                        {feature.cat}
                    </h4>
                    <ul className="space-y-1.5">
                        {feature.feature.map((item, ind) => {
                            const isIncluded = item.startsWith('✔️');
                            const text = item.replace(/^[✔️❌]\s*/, '');

                            return (
                                <li
                                    key={ind}
                                    className={cn(
                                        "text-xs flex items-start gap-2"
                                    )}
                                >
                                    <span className="flex-1">{text}</span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            ))}

            {plans.features.length > 3 && (
                <button
                    onClick={() => setShowDetailsDialog(true)}
                    className="flex w-full items-center  mt-4   gap-1 text-xs hover:underline text-primary hover:text-orange-600 font-semibold transition-colors duration-200 cursor-pointer "
                >
                    Read all features
                    <ArrowUpRight className="h-4 w-4" />
                </button>
            )}

            <PackageDetails
                plan={plans}
                open={showDetailsDialog}
                onOpenChange={setShowDetailsDialog}
            />
        </div>
    )
}

function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
