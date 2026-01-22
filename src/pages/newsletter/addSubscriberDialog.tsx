import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Icon } from "@iconify/react";

export function AddSubscriberDialog() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const queryClient = useQueryClient();

    const { mutate, isPending } = useMutation({
        mutationFn: async (data: { email: string; name: string }) => {
            return await api.post("/newsletter/subscribe", data);
        },
        onSuccess: () => {
            toast.success("Subscriber added successfully");
            queryClient.invalidateQueries({ queryKey: ["getSubscribers"] });
            queryClient.invalidateQueries({ queryKey: ["getNewsletterAnalytics"] });
            setOpen(false);
            setEmail("");
            setName("");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to add subscriber");
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutate({ email, name });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="rounded-sm hover:shadow-md transition-shadow">
                    <Icon icon="solar:add-circle-bold" className="mr-2" width="20" />
                    Add Subscriber
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Subscriber</DialogTitle>
                    <DialogDescription>
                        Manually add a new subscriber to the newsletter.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                            Name
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="col-span-3"
                            placeholder="John Doe"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="email" className="text-right">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="col-span-3"
                            placeholder="john@example.com"
                            required
                        />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? "Adding..." : "Add Subscriber"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
