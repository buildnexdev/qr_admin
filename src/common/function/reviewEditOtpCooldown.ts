/**
 * Review Edit OTP timings (client-side UX helpers).
 *
 * - OTP validity: 20 minutes (user can verify within this window)
 * - Resend cooldown: short delay to prevent spam, but not 20 minutes
 */
export const REVIEW_EDIT_OTP_VALID_MS = 20 * 60 * 1000;
export const REVIEW_EDIT_OTP_RESEND_COOLDOWN_MS = 30 * 1000;

const STORAGE_KEY = 'napaReviewEditOtpSentAtByMember';

function readMap(): Record<string, number> {
	if (typeof sessionStorage === 'undefined') return {};
	try {
		const raw = sessionStorage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw) as unknown;
		return parsed && typeof parsed === 'object' ? (parsed as Record<string, number>) : {};
	} catch {
		return {};
	}
}

function writeMap(map: Record<string, number>) {
	if (typeof sessionStorage === 'undefined') return;
	try {
		sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
	} catch {
		// ignore quota / private mode
	}
}

function memberKey(memberStudentID: string | undefined | null): string | null {
	if (memberStudentID === undefined || memberStudentID === null) return null;
	const s = `${memberStudentID}`.trim();
	return s.length ? s : null;
}

/** Returns sent-at epoch ms if still inside the 20-minute window; otherwise null (and prunes stale entry). */
export function getActiveReviewEditOtpSentAt(
	memberStudentID: string | number | undefined | null,
): number | null {
	const key = memberKey(memberStudentID as string);
	if (!key) return null;
	const map = readMap();
	const sentAt = map[key];
	if (typeof sentAt !== 'number' || Number.isNaN(sentAt)) {
		return null;
	}
	if (Date.now() - sentAt > REVIEW_EDIT_OTP_VALID_MS) {
		delete map[key];
		writeMap(map);
		return null;
	}
	return sentAt;
}

export function markReviewEditOtpSent(memberStudentID: string | number | undefined | null) {
	const key = memberKey(memberStudentID as string);
	if (!key) return;
	const map = readMap();
	map[key] = Date.now();
	writeMap(map);
}

export function clearReviewEditOtpSent(memberStudentID: string | number | undefined | null) {
	const key = memberKey(memberStudentID as string);
	if (!key) return;
	const map = readMap();
	delete map[key];
	writeMap(map);
}

export function getReviewEditOtpCooldownRemainingMs(
	memberStudentID: string | number | undefined | null,
): number {
	const sentAt = getActiveReviewEditOtpSentAt(memberStudentID);
	if (sentAt == null) return 0;
	return Math.max(0, REVIEW_EDIT_OTP_VALID_MS - (Date.now() - sentAt));
}

/** Short resend cooldown (does not affect OTP validity). */
export function getReviewEditOtpResendRemainingMs(
	memberStudentID: string | number | undefined | null,
): number {
	const key = memberKey(memberStudentID as string);
	if (!key) return 0;
	const map = readMap();
	const sentAt = map[key];
	if (typeof sentAt !== 'number' || Number.isNaN(sentAt)) return 0;
	return Math.max(0, REVIEW_EDIT_OTP_RESEND_COOLDOWN_MS - (Date.now() - sentAt));
}

export function formatReviewEditOtpCooldown(remainingMs: number): string {
	if (remainingMs <= 0) return '0 minutes';
	const minutes = Math.max(1, Math.ceil(remainingMs / 60000));
	return minutes === 1 ? '1 minute' : `${minutes} minutes`;
}

export function formatReviewEditOtpResend(remainingMs: number): string {
	if (remainingMs <= 0) return '0s';
	const seconds = Math.max(1, Math.ceil(remainingMs / 1000));
	return `${seconds}s`;
}
