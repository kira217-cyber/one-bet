import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Check,
  User,
  Mail,
  Phone,
  BadgeCheck,
  Loader2,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import { api } from "../../api/axios";
import {
  selectAuthLoading,
  selectIsAuthenticated,
  selectUser,
} from "../../features/auth/authSelectors";
import { logout } from "../../features/auth/authSlice";

const InputField = ({
  label,
  icon,
  placeholder,
  error,
  registration,
  disabled = false,
  readOnly = false,
}) => {
  return (
    <div className="space-y-2">
      <label className="block text-[14px] font-semibold text-white/95">
        {label}
      </label>

      <div
        className={`flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
          disabled || readOnly
            ? "border-white/10 bg-[#0a5f46]/70"
            : "border-white/10 bg-[#0a6a4d] focus-within:border-[#f2ef00]/70"
        }`}
      >
        <span className="shrink-0 text-white/75">{icon}</span>

        <input
          {...registration}
          disabled={disabled}
          readOnly={readOnly}
          placeholder={placeholder}
          className="w-full bg-transparent text-[15px] text-white placeholder:text-white/45 outline-none disabled:cursor-not-allowed disabled:text-white/70"
        />
      </div>

      {error ? (
        <p className="text-[12px] text-red-300">{error.message}</p>
      ) : null}
    </div>
  );
};

const PersonalInfo = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const authUser = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const authLoading = useSelector(selectAuthLoading);

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [profile, setProfile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      userId: "",
      email: "",
      phone: "",
      firstName: "",
      lastName: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast.error("Please login first.");
      navigate("/login", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (authLoading || !isAuthenticated) return;

      try {
        setLoadingProfile(true);

        const res = await api.get("/api/users/me");
        const user = res?.data?.user;

        if (!res?.data?.success || !user) {
          toast.error(res?.data?.message || "Failed to load user info.");
          return;
        }

        setProfile(user);

        reset({
          userId: user.userId || "",
          email: user.email || "",
          phone: user.phone || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
        });
      } catch (error) {
        const message =
          error?.response?.data?.message || "Failed to load user info.";
        toast.error(message);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [authLoading, isAuthenticated, reset]);

  const handleCopyReferralCode = async () => {
    const code = profile?.referralCode || authUser?.referralCode || "";

    if (!code) {
      toast.error("Referral code not found.");
      return;
    }

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Referral code copied.");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Failed to copy referral code.");
    }
  };

  const onSubmit = async (data) => {
    if (!isAuthenticated || !authUser) {
      toast.error("Your session expired. Please login again.");
      navigate("/login", { replace: true });
      return;
    }

    const payload = {
      userId: data.userId.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    };

    if (!payload.userId || !payload.phone) {
      toast.error("User ID and phone are required.");
      return;
    }

    try {
      setSubmitting(true);

      const res = await api.patch("/api/users/update-profile", payload);

      if (res?.data?.success) {
        toast.success(
          res?.data?.message ||
            "Personal info updated successfully. Please login again.",
        );

        dispatch(logout());
        navigate("/login", { replace: true });
      } else {
        toast.error(res?.data?.message || "Failed to update personal info.");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Something went wrong.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loadingProfile) {
    return (
      <div className="min-h-screen bg-[#004d3b] flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-white text-base font-medium">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      </div>
    );
  }

  const referralCode = profile?.referralCode || authUser?.referralCode || "";

  return (
    <div className="min-h-screen bg-[#004d3b] text-white">
      {/* Header */}
      <div className="sticky top-0 z-20 flex h-[68px] items-center justify-center bg-[#f2ef00] px-4 shadow-sm">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="absolute left-4 flex h-10 w-10 items-center justify-center text-white cursor-pointer"
        >
          <ArrowLeft size={28} strokeWidth={2.1} />
        </button>

        <h1 className="text-[24px] font-normal text-[#165a3e] sm:text-[26px]">
          Personal Info
        </h1>
      </div>

      <div className="mx-auto w-full max-w-[560px] px-3 pb-8 pt-4 sm:px-4">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Profile Form Card */}
          <div className="rounded-2xl bg-[#006c4b] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.20)] sm:p-5">
            <div className="mb-4">
              <h2 className="text-[18px] font-bold text-white">
                Update Personal Information
              </h2>
              <p className="mt-1 text-sm text-white/70">
                After updating your info, you will be logged out and need to log
                in again.
              </p>
            </div>

            <div className="space-y-4">
              <InputField
                label="User ID"
                icon={<User size={18} />}
                placeholder="Enter your user ID"
                registration={register("userId", {
                  required: "User ID is required",
                  minLength: {
                    value: 4,
                    message: "User ID must be at least 4 characters",
                  },
                  maxLength: {
                    value: 15,
                    message: "User ID must be at most 15 characters",
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9@._-]+$/,
                    message:
                      "User ID can contain only letters, numbers, @, dot, underscore and hyphen",
                  },
                })}
                error={errors.userId}
              />

              <InputField
                label="Email"
                icon={<Mail size={18} />}
                placeholder="Enter your email"
                registration={register("email", {
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                error={errors.email}
              />

              <InputField
                label="Phone"
                icon={<Phone size={18} />}
                placeholder="Enter your phone number"
                registration={register("phone", {
                  required: "Phone number is required",
                  minLength: {
                    value: 6,
                    message: "Phone number is too short",
                  },
                })}
                error={errors.phone}
              />

              <InputField
                label="First Name"
                icon={<BadgeCheck size={18} />}
                placeholder="Enter your first name"
                registration={register("firstName")}
                error={errors.firstName}
              />

              <InputField
                label="Last Name"
                icon={<BadgeCheck size={18} />}
                placeholder="Enter your last name"
                registration={register("lastName")}
                error={errors.lastName}
              />
            </div>
          </div>

          {/* Referral Code Card */}
          <div className="rounded-2xl bg-[#006c4b] p-4 shadow-[0_6px_18px_rgba(0,0,0,0.20)] sm:p-5">
            <div className="mb-3">
              <h3 className="text-[17px] font-bold text-white">
                Referral Code
              </h3>
              <p className="mt-1 text-sm text-white/70">
                You can copy and share your referral code.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#0a6a4d] px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[16px] font-semibold tracking-[0.18em] text-[#f2ef00]">
                  {referralCode || "N/A"}
                </p>
              </div>

              <button
                type="button"
                onClick={handleCopyReferralCode}
                className="inline-flex h-10 min-w-[92px] items-center justify-center gap-2 rounded-lg bg-[#f2ef00] px-3 text-sm font-semibold text-[#165a3e] transition hover:opacity-95 active:scale-[0.98] cursor-pointer"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting || !isDirty}
            className="flex h-[56px] w-full items-center justify-center rounded-xl bg-[#f2ef00] text-[20px] font-semibold text-[#165a3e] shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 cursor-pointer"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating...
              </span>
            ) : (
              "Update Info"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;
