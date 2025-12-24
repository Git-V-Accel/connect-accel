import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../ui/input-otp";

type OtpDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email?: string;
  title?: string;
  description?: string;
  otpLength?: number;
  loading?: boolean;
  resendLoading?: boolean;
  onVerify: (otp: string) => Promise<void> | void;
  onResend: () => Promise<void> | void;
};

export function OtpDialog({
  open,
  onOpenChange,
  email,
  title = "Verify Your Email",
  description = "Enter the 6-digit verification code sent to your email address to continue.",
  otpLength = 6,
  loading = false,
  resendLoading = false,
  onVerify,
  onResend,
}: OtpDialogProps) {
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!open) {
      setOtp("");
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== otpLength || loading) return;
    await onVerify(otp);
  };

  const handleOtpChange = (value: string) => {
    // Only allow digits and limit to otpLength
    const digitsOnly = value.replace(/\D/g, "").slice(0, otpLength);
    setOtp(digitsOnly);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription className="text-base text-gray-700">
            {description}{" "}
            {email && <span className="font-semibold text-gray-900">({email})</span>}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-2 ">
            {/* <label className="text-sm font-medium text-gray-700 ">
              {otpLength}-digit OTP
            </label> */}
            <div className="flex justify-center mt-6">
              <InputOTP
                maxLength={otpLength}
                value={otp}
                onChange={handleOtpChange}
                autoFocus
              >
                <InputOTPGroup className="flex gap-2">
                  {Array.from({ length: otpLength }).map((_, idx) => (
                    <InputOTPSlot
                      key={idx}
                      index={idx}
                      className="w-12 h-14 text-xl font-semibold border-2 border-gray-300  "
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={otp.length !== otpLength || loading}
            >
              {loading ? "Verifying..." : "Verify"}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 text-base font-semibold"
              onClick={onResend}
              disabled={resendLoading || loading}
            >
              {resendLoading ? "Resending..." : "Resend OTP"}
            </Button>
          </div>
        </form>

        <DialogFooter className="mt-2 text-center  justify-center text-sm text-gray-600 flex flex-col gap-2">
          Didn't get the email? Check spam or resend the OTP.
          
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default OtpDialog;

