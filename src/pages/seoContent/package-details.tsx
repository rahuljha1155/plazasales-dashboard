import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from 'lucide-react';
import { Icon } from '@iconify/react/dist/iconify.js';

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

interface PackageDetailsProps {
    plan: PricingPlan;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PackageDetails({ plan, open, onOpenChange }: PackageDetailsProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] mb-0 pb-0 overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold text-primary">
                            {plan.name}
                        </DialogTitle>
                        {plan.isPopular && (
                            <Badge className="bg-primary hover:bg-primary">
                                Most Popular
                            </Badge>
                        )}
                    </div>
                    <DialogDescription className="text-base">
                        {plan.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-2  space-y-6">
                    {/* Pricing Section */}
                    <div className=" rounded-lg">
                        <div className="flex items-baseline  gap-2">
                            <span className="text-lg font-semibold text-muted-foreground">Rs.</span>
                            <span className="text-4xl font-bold  text-orange-600">
                                {plan.isCustom ? "129,999+" : Number(plan.price).toLocaleString()}
                            </span>
                            <span className="text-lg text-muted-foreground">/ {plan.period}</span>
                        </div>
                        {!plan.isCustom && (
                            <p className=" text-sm text-muted-foreground mt-2">
                                Yearly: Rs. {Number(plan.yearlyPrice).toLocaleString()}
                            </p>
                        )}
                    </div>

                    {/* Features Section */}
                    <div className="space-y-6 mt-10">
                        <h3 className="text-xl font-semibold text-foreground border-b pb-2">
                            Package Features
                        </h3>

                        <div className="grid gap-6">
                            {plan.features.map((feature, idx) => (
                                <div key={idx} className="space-y-3">
                                    <h4 className="text-lg font-semibold text-zinc-800 flex items-center gap-2">
                                        {feature.cat}
                                    </h4>
                                    <div className="grid gap-2 ">
                                        {feature.feature.map((item, ind) => {
                                            const isIncluded = item.startsWith('✔️');
                                            const text = item.replace(/^[✔️❌]\s*/, '');

                                            return (
                                                <div
                                                    key={ind}
                                                    className={`flex items-start gap-3  rounded-md transition-colors `}
                                                >
                                                    {isIncluded ? (
                                                        <Icon icon={"ic:twotone-check"} className="h-5 w-5 text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5" />
                                                    ) : (
                                                        <Icon icon={"oui:cross"} className="h-5 w-5 text-red-500 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                                    )}
                                                    <span
                                                        className={`text-sm ${isIncluded
                                                            ? 'text-foreground font-medium'
                                                            : 'text-muted-foreground line-through'
                                                            }`}
                                                    >
                                                        {text}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Button */}
                    <div className="pt-4 pb-3 border-t sticky bottom-0 bg-background flex justify-end items-center">
                        <a
                            href={plan.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block w-fit hover:bg-primary border border-primary text-primary  hover:text-white text-center py-2 px-6 rounded-sm font-semibold transition-colors duration-200"
                        >
                            {plan.buttonText}
                        </a>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
