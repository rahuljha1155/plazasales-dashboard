"use client";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import List from "./list";

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

interface PricingProps {
  plans: PricingPlan[];
}

export function Pricing({ plans }: PricingProps) {
  return (
    <div className="py-6">


      <div className="grid grid-cols-1 md:grid-cols-2 pt-5 lg:grid-cols-4 gap-3">
        {plans.map((plan, index) => (
          <div
            key={index}
            className={cn(
              "border rounded-2xl p-6 bg-background flex flex-col relative transition-all duration-300 hover:shadow-lg",
              plan.isPopular
                ? "border-orange-500 border-2 shadow-md"
                : "border-border",
              plan.isCustom && "bg-gradient-to-br from-orange-50 to-white dark:from-orange-950/20 dark:to-background"
            )}
          >
            {plan.isPopular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white py-1 px-4 rounded-full flex items-center gap-1 shadow-md">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-sm font-semibold">
                  Most Popular
                </span>
              </div>
            )}

            <div className="flex-1 flex flex-col">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {plan.description}
                </p>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-bold text-foreground">Rs.</span>
                  <span className="text-4xl font-bold text-foreground">
                    {plan.isCustom ? "129,999+" : Number(plan.price).toLocaleString()}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  per month
                </p>
              </div>

              <div className="flex-1 mb-6">
                <List plans={plan} />
              </div>

              <Link
                to={plan.href}
                target="_blank"
                className={cn(
                  buttonVariants({
                    variant: plan.isPopular ? "default" : "outline",
                  }),
                  "w-full font-semibold transition-all duration-300",
                  plan.isPopular
                    ? "bg-primary hover:bg-primary text-white"
                    : "hover:bg-primary hover:text-white hover:border-orange-500"
                )}
              >
                {plan.buttonText}
              </Link>
            </div>
          </div>
        ))}
      </div>


    </div>
  );
}
