"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  REFERRAL_COOKIE,
  getCookie,
  setCookie,
  phoneToReferral,
  isValidIndianPhone,
  isValidTNPincode,
  isValidReferralCode,
  getAuth,
  setAuth,
  clearAuth,
  upsertMember,
  getReferralTree,
  generateOtp,
  type AuthUser,
  type Member,
} from "@/lib/referral";

type Step = "form" | "otp" | "dashboard";

const inputCls =
  "w-full rounded-lg border border-stone-300 bg-white px-4 py-2.5 text-sm text-ink outline-none transition focus:border-maroon focus:ring-2 focus:ring-maroon/20";

export default function JoinFlow({ urlReferral }: { urlReferral?: string }) {
  const [step, setStep] = useState<Step>("form");
  const [user, setUser] = useState<AuthUser | null>(null);

  // form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pincode, setPincode] = useState("");
  const [referral, setReferral] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState<"" | "Male" | "Female">("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // otp state
  const otpRef = useRef("");
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpNote, setOtpNote] = useState("");

  // referral list for dashboard
  const [tree, setTree] = useState<{ member: Member; referredCount: number }[]>([]);
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState("");

  // ---- on mount: restore auth + reconcile referral (URL > cookie) ----
  useEffect(() => {
    const existing = getAuth();
    if (existing) {
      setUser(existing);
      setStep("dashboard");
    }

    const fromUrl = urlReferral?.trim().toUpperCase();
    if (fromUrl) {
      setReferral(fromUrl);
      setCookie(REFERRAL_COOKIE, fromUrl, 365); // new URL value overrides cookie
    } else {
      const fromCookie = getCookie(REFERRAL_COOKIE);
      if (fromCookie) setReferral(fromCookie);
    }
  }, [urlReferral]);

  // ---- refresh dashboard data when entering it ----
  useEffect(() => {
    if (step === "dashboard" && user) {
      setTree(getReferralTree(user.referralCode));
      setShareLink(
        `${window.location.origin}/join?referral=${user.referralCode}`,
      );
    }
  }, [step, user]);

  /* --------------------------- step 1: the form --------------------------- */
  function submitForm(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Please enter your name.";
    if (!isValidIndianPhone(phone))
      errs.phone = "Enter a valid 10-digit Indian mobile number.";
    if (!isValidTNPincode(pincode))
      errs.pincode = "Enter a valid 6-digit Tamil Nadu PIN code.";
    if (referral.trim() && !isValidReferralCode(referral))
      errs.referral = "Referral code should be 7 letters/numbers.";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    const code = generateOtp();
    otpRef.current = code;
    // No backend: print the OTP so it can be used in the demo.
    console.log(`[join] OTP for +91 ${phone}: ${code}`);
    setOtpNote("A 6-digit OTP has been generated (printed to the browser console for this demo).");
    setOtp("");
    setOtpError("");
    setStep("otp");
  }

  /* --------------------------- step 2: verify OTP -------------------------- */
  function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    // Demo mode: accept any 6-digit OTP.
    if (!/^\d{6}$/.test(otp.trim())) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }

    const referralCode = phoneToReferral(phone);
    const member: Member = {
      name: name.trim(),
      phone,
      referralCode,
      referredBy: referral.trim() ? referral.trim().toUpperCase() : null,
      pincode,
      dob: dob || undefined,
      gender: gender || "",
      createdAt: new Date().toISOString(),
    };
    upsertMember(member);
    const authUser: AuthUser = { name: member.name, phone, referralCode };
    setAuth(authUser);
    console.log("[join] verified & registered:", member);

    setUser(authUser);
    setStep("dashboard");
  }

  function resendOtp() {
    const code = generateOtp();
    otpRef.current = code;
    console.log(`[join] OTP (resent) for +91 ${phone}: ${code}`);
    setOtpNote("A new OTP has been generated (see browser console).");
    setOtpError("");
  }

  function logout() {
    clearAuth(); // keep the referral cookie intentionally
    setUser(null);
    setName("");
    setPhone("");
    setPincode("");
    setDob("");
    setGender("");
    setOtp("");
    otpRef.current = "";
    const fromCookie = getCookie(REFERRAL_COOKIE);
    setReferral(fromCookie || "");
    setStep("form");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  }

  /* ------------------------------- rendering ------------------------------ */

  if (step === "dashboard" && user) {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl border border-gold/20 bg-white p-8 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-saffron">
            Welcome
          </p>
          <h2 className="mt-2 font-display text-3xl text-maroon">
            Vanakkam, {user.name}!
          </h2>
          <p className="mt-3 text-ink/75">
            You are now part of the Aram Valartha Naayaki Sevai Maiyam community.
            Share your referral code below to invite others to join the seva.
          </p>

          <div className="mt-7 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl bg-cream p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/60">
                Your Referral Code
              </p>
              <p className="mt-1 font-display text-3xl tracking-[0.2em] text-maroon">
                {user.referralCode}
              </p>
            </div>
            <div className="rounded-xl bg-cream p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink/60">
                Registered Mobile
              </p>
              <p className="mt-1 font-display text-2xl text-maroon">
                +91 {user.phone}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-cream p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/60">
              Your Referral Link
            </p>
            <div className="mt-2 flex flex-col gap-2 sm:flex-row">
              <input readOnly value={shareLink} className={inputCls} />
              <button
                onClick={copyLink}
                className="shrink-0 rounded-lg bg-maroon px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-maroon-600"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="font-display text-xl text-maroon">
              People who joined with your code
            </h3>
            {tree.length === 0 ? (
              <p className="mt-2 text-sm text-ink/60">
                No one has joined using your referral code yet. Share your link to
                grow the community!
              </p>
            ) : (
              <ul className="mt-4 divide-y divide-stone-100 rounded-xl border border-stone-100">
                {tree.map(({ member, referredCount }) => (
                  <li
                    key={member.phone}
                    className="flex items-center justify-between gap-4 px-5 py-3"
                  >
                    <div>
                      <p className="font-semibold text-ink">{member.name}</p>
                      <p className="text-xs text-ink/55">
                        Code {member.referralCode}
                      </p>
                    </div>
                    <span className="rounded-full bg-sand px-3 py-1 text-xs font-semibold text-maroon">
                      Referred {referredCount}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-stone-100 pt-6">
            <Link href="/" className="text-sm font-semibold text-maroon hover:underline">
              ← Back to Home
            </Link>
            <button
              onClick={logout}
              className="rounded-full border border-maroon px-6 py-2.5 text-sm font-semibold uppercase tracking-wide text-maroon transition hover:bg-maroon hover:text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <div className="mx-auto max-w-md">
        <form
          onSubmit={verifyOtp}
          className="rounded-2xl border border-gold/20 bg-white p-8 shadow-sm"
        >
          <h2 className="font-display text-2xl text-maroon">Verify your number</h2>
          <p className="mt-2 text-sm text-ink/70">
            Enter the OTP sent to <strong>+91 {phone}</strong>.
          </p>
          {otpNote && (
            <p className="mt-3 rounded-md bg-cream px-4 py-2 text-xs text-ink/70">
              {otpNote}
            </p>
          )}

          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            inputMode="numeric"
            placeholder="6-digit OTP"
            className={`${inputCls} mt-5 text-center text-lg tracking-[0.4em]`}
          />
          {otpError && <p className="mt-2 text-sm text-red-700">{otpError}</p>}

          <button
            type="submit"
            className="mt-5 w-full rounded-full bg-maroon px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-maroon-600"
          >
            Verify &amp; Join
          </button>

          <div className="mt-4 flex justify-between text-sm">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="text-ink/60 hover:text-maroon"
            >
              ← Edit details
            </button>
            <button
              type="button"
              onClick={resendOtp}
              className="font-semibold text-saffron hover:text-maroon"
            >
              Resend OTP
            </button>
          </div>
        </form>
      </div>
    );
  }

  // step === "form"
  return (
    <div className="mx-auto max-w-xl">
      <form
        onSubmit={submitForm}
        className="space-y-5 rounded-2xl border border-gold/20 bg-white p-8 shadow-sm"
        noValidate
      >
        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Name <span className="text-maroon">*</span>
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputCls}
            placeholder="Your full name"
          />
          {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Phone Number <span className="text-maroon">*</span>
          </label>
          <div className="flex items-stretch">
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-stone-300 bg-cream px-3 text-sm text-ink/70">
              +91
            </span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              inputMode="numeric"
              className={`${inputCls} rounded-l-none`}
              placeholder="10-digit mobile number"
            />
          </div>
          {errors.phone && <p className="mt-1 text-xs text-red-700">{errors.phone}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Pincode <span className="text-maroon">*</span>
          </label>
          <input
            value={pincode}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 6);
              setPincode(v);
              setErrors((prev) => ({
                ...prev,
                pincode:
                  v && !isValidTNPincode(v)
                    ? "Enter a valid 6-digit Tamil Nadu PIN code."
                    : "",
              }));
            }}
            inputMode="numeric"
            aria-invalid={!!errors.pincode}
            className={`${inputCls} ${
              pincode && !errors.pincode ? "border-green-500 focus:border-green-500 focus:ring-green-500/20" : ""
            }`}
            placeholder="6-digit Tamil Nadu PIN code"
          />
          {errors.pincode ? (
            <p className="mt-1 text-xs text-red-700">{errors.pincode}</p>
          ) : pincode.length === 6 ? (
            <p className="mt-1 text-xs text-green-700">✓ Valid Tamil Nadu PIN code</p>
          ) : null}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-ink">
            Referral Code <span className="text-ink/40">(optional)</span>
          </label>
          <input
            value={referral}
            onChange={(e) =>
              setReferral(e.target.value.toUpperCase().replace(/[^0-9A-Z]/g, "").slice(0, 7))
            }
            className={`${inputCls} tracking-[0.2em]`}
            placeholder="e.g. 1Z2A3B4"
          />
          {errors.referral && (
            <p className="mt-1 text-xs text-red-700">{errors.referral}</p>
          )}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Date of Birth <span className="text-ink/40">(optional)</span>
            </label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-ink">
              Gender <span className="text-ink/40">(optional)</span>
            </label>
            <div className="flex gap-4 pt-2.5">
              {(["Male", "Female"] as const).map((g) => (
                <label key={g} className="flex items-center gap-2 text-sm text-ink/80">
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === g}
                    onChange={() => setGender(g)}
                    className="accent-maroon"
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full rounded-full bg-maroon px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-maroon-600"
        >
          Continue
        </button>
      </form>
    </div>
  );
}
