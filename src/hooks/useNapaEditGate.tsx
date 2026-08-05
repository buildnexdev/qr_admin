import { useCallback, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { napaEditUnlockedChangeStart } from '../redux/napa/napa.action';
import { selectNapaEditUnlocked, selectNapaEditUnlockedUntil } from '../redux/napa/napa.selector';
import showNotification from '../components/extras/showNotification';

/**
 * After Review tab → Edit → OTP success, `napaEditUnlocked` is true in Redux.
 * Use for uploads and inline field edits across NAPA document tabs.
 */
export function useNapaEditGate() {
	const dispatch = useDispatch();
	const napaEditUnlocked = useSelector(selectNapaEditUnlocked);
	const napaEditUnlockedUntil = useSelector(selectNapaEditUnlockedUntil);

	// Auto-lock editing after 20 minutes from OTP success.
	useEffect(() => {
		if (!napaEditUnlockedUntil) return undefined;

		const msLeft = napaEditUnlockedUntil - Date.now();
		if (msLeft <= 0) {
			dispatch(napaEditUnlockedChangeStart(false));
			return undefined;
		}

		const t = window.setTimeout(() => {
			dispatch(napaEditUnlockedChangeStart(false));
		}, msLeft);

		return () => window.clearTimeout(t);
	}, [dispatch, napaEditUnlockedUntil]);

	const requireUnlock = useCallback(() => {
		if (napaEditUnlocked) return true;
		showNotification(
			'Editing locked',
			'Open the Review tab, click Edit, and verify OTP to upload or change details.',
			'warning',
		);
		return false;
	}, [napaEditUnlocked]);

	const openFilePicker = useCallback(
		(ref: React.RefObject<HTMLInputElement | null>) => {
			if (!requireUnlock()) return;
			ref.current?.click();
		},
		[requireUnlock],
	);

	return { napaEditUnlocked, requireUnlock, openFilePicker };
}

export default useNapaEditGate;
