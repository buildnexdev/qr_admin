import React, {
	useLayoutEffect,
	forwardRef,
	ReactElement,
	useContext,
	useEffect,
	useState,
} from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { ISubHeaderProps } from '../SubHeader/SubHeader';
import { IPageProps } from '../Page/Page';
import AuthContext from '../../contexts/authContext';
import { hidePages } from '../../menu';

interface IPageWrapperProps {
	isProtected?: boolean;
	title?: string;
	description?: string;
	children:
		| ReactElement<ISubHeaderProps>[]
		| ReactElement<IPageProps>
		| ReactElement<IPageProps>[];
	className?: string;
}
	const PageWrapper = forwardRef<HTMLDivElement, IPageWrapperProps>(
		({ isProtected, title, description, className, children }, ref) => {
		const [isSearchOpen, setIsSearchOpen] = useState(false);
		const [searchText, setSearchText] = useState('');
		useLayoutEffect(() => {
			// @ts-ignore
			document.getElementsByTagName('TITLE')[0].text = `${title ? `${title} | ` : ''}${
				process.env.REACT_APP_SITE_NAME
			}`;
			// @ts-ignore
			document
				?.querySelector('meta[name="description"]')
				.setAttribute('content', description || process.env.REACT_APP_META_DESC || '');
		});

		const { user } = useContext(AuthContext);

		const navigate = useNavigate();
		useEffect(() => {
			if (isProtected && user === '') {
				navigate(`../${hidePages.login.path}`);
			}
			return () => {};
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, []);

		// Global spotlight-style search (Ctrl+F / Cmd+F)
		useEffect(() => {
			const handleKeyDown = (event: KeyboardEvent) => {
				if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
					event.preventDefault();
					setIsSearchOpen(true);
				}
				if (event.key === 'Escape') {
					setIsSearchOpen(false);
				}
			};

			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('keydown', handleKeyDown);
			};
		}, []);

		const handleSpotlightSearchSubmit = (e: React.FormEvent) => {
			e.preventDefault();
			const trimmed = searchText.trim();
			if (!trimmed) {
				setIsSearchOpen(false);
				return;
			}
			// Accept either a plain number or a string containing a number (e.g. pasted text/filenames).
			// We use the longest digit sequence as the "searchNumber".
			const digitGroups = trimmed.match(/\d+/g) ?? [];
			const searchNumber = digitGroups.sort((a, b) => b.length - a.length)[0] ?? '';
			// Avoid accidental navigation on tiny numbers.
			if (searchNumber.length < 6) {
				setIsSearchOpen(false);
				return;
			}
			// Do not put phone/search number in the URL; pass via route state instead.
			// Use same style as existing navigation calls (no leading slash).
			navigate(`${hidePages.applicantDetails.path}`, {
				state: { searchNumber },
			});
			setIsSearchOpen(false);
		};

		return (
			<div ref={ref} className={classNames('page-wrapper', 'container-fluid', className)}>
				<div className={isSearchOpen ? '' : 'd-none'}>
					<div
						className='position-fixed top-0 start-0 w-100 h-100'
						style={{ zIndex: 1050, backgroundColor: 'rgba(0,0,0,0.35)' }}
						onClick={() => setIsSearchOpen(false)}>
						<div
							className='d-flex justify-content-center align-items-start'
							style={{ marginTop: '15vh' }}
							onClick={(e) => e.stopPropagation()}>
							<form
								onSubmit={handleSpotlightSearchSubmit}
								className='shadow-lg rounded-pill d-flex align-items-center px-4 py-2'
								style={{
									minWidth: '320px',
									maxWidth: '520px',
									width: '60%',
									backgroundColor: '#ffffff',
								}}>
								<span className='me-2'>
									{/* simple search icon circle; uses existing icon font in pages */}
									<i className='material-icons-outlined'>search</i>
								</span>
								<input
									type='text'
									className='form-control border-0 bg-transparent'
									placeholder='Search number...'
									autoFocus
									value={searchText}
									onChange={(e) => setSearchText(e.target.value)}
								/>
							</form>
						</div>
					</div>
				</div>
				{children}
			</div>
		);
	},
);
PageWrapper.displayName = 'PageWrapper';
// @ts-ignore
PageWrapper.propTypes = {
	isProtected: PropTypes.bool,
	title: PropTypes.string,
	description: PropTypes.string,
	// @ts-ignore
	children: PropTypes.node.isRequired,
	className: PropTypes.string,
};
// @ts-ignore
(PageWrapper as any).defaultProps = {
	isProtected: true,
	title: undefined,
	description: undefined,
	className: undefined,
};

export default PageWrapper;
