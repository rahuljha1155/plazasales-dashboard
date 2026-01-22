import { useState } from "react";
import { api } from "@/services/api";
import { toast } from "sonner";

interface ChangePasswordProps {
  onSuccess?: () => void;
}

export default function ChangePasswordDialog({ onSuccess }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setConfirmPasswordError("");
    if (!currentPassword || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    let valid = true;
    if (!passwordPattern.test(password)) {
      setPasswordError("Password must be at least 6 characters long and include at least one letter, one number, and one special character.");
      valid = false;
    }
    if (!passwordPattern.test(confirmPassword)) {
      setConfirmPasswordError("Confirm password must be at least 6 characters long and include at least one letter, one number, and one special character.");
      valid = false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      valid = false;
    }
    if (!valid) return;
    setLoading(true);
    try {
      const res = await api.patch("/auth/change-password", {
        currentPassword,
        password,
        confirmPassword,
      });
      if (res.data?.status === 200) {
        toast.success("Password changed successfully");
        setCurrentPassword("");
        setPassword("");
        setConfirmPassword("");
        onSuccess?.();
      } else {
        toast.error(res.data?.message || "Failed to change password");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Current Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="border p-1 w-full pr-10"
            value={currentPassword}
            onChange={e => setCurrentPassword(e.target.value)}
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">New Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="border p-1 w-full pr-10"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {passwordError && <div className="text-xs text-red-500 mt-1">{passwordError}</div>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirm New Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="border p-1 w-full pr-10"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          {confirmPasswordError && <div className="text-xs text-red-500 mt-1">{confirmPasswordError}</div>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          id="toggle-password"
          type="checkbox"
          checked={showPassword}
          onChange={() => setShowPassword(v => !v)}
        />
        <label htmlFor="toggle-password" className="text-sm cursor-pointer">Show Passwords</label>
      </div>
      <button
        type="submit"
        className="bg-primary text-white w-full py-1 rounded-md cursor-pointer"
        disabled={loading}
      >
        {loading ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}
