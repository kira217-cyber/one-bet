import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import { logout } from "../../features/auth/authSlice";

const FieldRow = React.memo(function FieldRow({
  label,
  placeholder,
  type = "password",
  show,
  setShow,
  registration,
  error,
  autoComplete = "off",
}) {
  return (
    <div className="grid grid-cols-[100px_1fr_34px] items-center gap-3 border-b border-white/10 px-4 py-4 last:border-b-0 sm:grid-cols-[112px_1fr_40px]">
      <label className="text-white text-[14px] leading-[1.05] font-semibold sm:text-[15px]">
        {label}
      </label>

      <div className="min-w-0">
        <input
          type={show ? "text" : type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-[15px] text-white placeholder:text-white/55 outline-none"
          {...registration}
        />
        {error ? (
          <p className="mt-1 text-[11px] text-red-300">{error.message}</p>
        ) : null}
      </div>

      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        className="flex h-8 w-8 items-center justify-center text-white/85 transition hover:text-white cursor-pointer"
      >
        {show ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>
    </div>
  );
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  const [submitting, setSubmitting] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    mode: "onChange",
  });

  const currentPassword = watch("currentPassword");
  const newPassword = watch("newPassword");
  const confirmNewPassword = watch("confirmNewPassword");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login first.");
      navigate("/login");
    }
  }, [authLoading, isAuthenticated, navigate]);

  const passwordChecks = useMemo(() => {
    const value = newPassword || "";

    return {
      length: value.length >= 8 && value.length <= 20,
      uppercase: /[A-Z]/.test(value),
      lowercase: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[^A-Za-z0-9]/.test(value),
    };
  }, [newPassword]);

  const isPasswordStrong = useMemo(() => {
    return Object.values(passwordChecks).every(Boolean);
  }, [passwordChecks]);

  const currentPasswordRegister = register("currentPassword", {
    required: "Current password is required",
  });

  const newPasswordRegister = register("newPassword", {
    required: "New password is required",
    validate: {
      length: (value) =>
        (value.length >= 8 && value.length <= 20) ||
        "Password must be 8-20 characters",
      uppercase: (value) =>
        /[A-Z]/.test(value) || "At least 1 uppercase letter is required",
      lowercase: (value) =>
        /[a-z]/.test(value) || "At least 1 lowercase letter is required",
      number: (value) => /[0-9]/.test(value) || "At least 1 number is required",
      special: (value) =>
        /[^A-Za-z0-9]/.test(value) ||
        "At least 1 special character is required",
    },
  });

  const confirmPasswordRegister = register("confirmNewPassword", {
    required: "Please confirm your new password",
    validate: (value) => value === newPassword || "Passwords do not match",
  });

  const onSubmit = async (data) => {
    if (!isAuthenticated || !user) {
      toast.error("Your login session is missing. Please login again.");
      navigate("/login");
      return;
    }

    if (data.currentPassword === data.newPassword) {
      toast.error("New password must be different from current password.");
      return;
    }

    if (!isPasswordStrong) {
      toast.error("Please follow all password requirements.");
      return;
    }

    if (data.newPassword !== data.confirmNewPassword) {
      toast.error("Confirm password does not match.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.put("/api/users/reset-password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmNewPassword: data.confirmNewPassword,
      });

      if (res?.data?.success) {
        reset();
        dispatch(logout());
        toast.success(
          res.data.message ||
            "Password updated successfully. Please login again.",
        );
        navigate("/login", { replace: true });
      } else {
        toast.error(res?.data?.message || "Failed to update password.");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Something went wrong.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#004d3b] flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-white text-base font-medium">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#004d3b] text-white">
      <div className="sticky top-0 z-20 flex h-[68px] items-center justify-center bg-[#f2ef00] px-4 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 flex h-10 w-10 items-center justify-center text-white cursor-pointer"
        >
          <ArrowLeft size={28} strokeWidth={2.1} />
        </button>

        <h1 className="text-[24px] font-normal text-[#165a3e] sm:text-[26px]">
          Reset password
        </h1>
      </div>

      <div className="mx-auto w-full max-w-[520px] px-3 pb-6 pt-3 sm:px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="overflow-hidden rounded-md bg-[#006c4b] shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
            <FieldRow
              label="Current password"
              placeholder="Current password"
              type="password"
              show={showCurrent}
              setShow={setShowCurrent}
              registration={currentPasswordRegister}
              error={errors.currentPassword}
              autoComplete="current-password"
            />

            <FieldRow
              label="New password"
              placeholder="New password"
              type="password"
              show={showNew}
              setShow={setShowNew}
              registration={newPasswordRegister}
              error={errors.newPassword}
              autoComplete="new-password"
            />

            <FieldRow
              label="Confirm new password"
              placeholder="Confirm new password"
              type="password"
              show={showConfirm}
              setShow={setShowConfirm}
              registration={confirmPasswordRegister}
              error={errors.confirmNewPassword}
              autoComplete="new-password"
            />
          </div>

          <div className="rounded-md bg-[#006c4b] px-4 py-4 shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle size={18} className="text-white" />
              <h2 className="text-[16px] font-bold text-white">
                Password requirements
              </h2>
            </div>

            <ol className="space-y-1.5 pl-5 text-[15px] leading-7 text-white">
              <li className={passwordChecks.length ? "text-[#f2ef00]" : ""}>
                Must be 8-20 characters in length
              </li>
              <li className={passwordChecks.uppercase ? "text-[#f2ef00]" : ""}>
                must contain 1 uppercase alphabet(AZ) at least
              </li>
              <li className={passwordChecks.lowercase ? "text-[#f2ef00]" : ""}>
                must contain 1 lowercase alphabet(az) at least
              </li>
              <li className={passwordChecks.number ? "text-[#f2ef00]" : ""}>
                must contain 1 number(0-9) at least
              </li>
              <li className={passwordChecks.special ? "text-[#f2ef00]" : ""}>
                must contain 1 special character
              </li>
            </ol>
          </div>

          {(currentPassword || newPassword || confirmNewPassword) && (
            <div className="px-1 text-sm">
              {newPassword &&
              confirmNewPassword &&
              newPassword === confirmNewPassword ? (
                <p className="text-green-300">Passwords matched.</p>
              ) : confirmNewPassword ? (
                <p className="text-red-300">Passwords do not match.</p>
              ) : null}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-[58px] w-full items-center justify-center rounded-md bg-[#f2ef00] text-[22px] font-normal text-[#165a3e] shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Confirming...
              </span>
            ) : (
              "Confirm"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
