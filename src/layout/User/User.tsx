import React, { useState, useContext, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import classNames from 'classnames';
import { useWindowSize } from 'react-use';
import { hidePages } from '../../menu';
import { DropdownItem, DropdownMenu } from '../../components/bootstrap/Dropdown';
import Button from '../../components/bootstrap/Button';
import useDarkMode from '../../hooks/useDarkMode';
import Collapse from '../../components/bootstrap/Collapse';
import { NavigationLine } from '../Navigation/Navigation';
import Icon from '../../components/icon/Icon';
import useNavigationItemHandle from '../../hooks/useNavigationItemHandle';
import UserImageWebp from '../../assets/img/wanna/wanna1.webp';
import UserImage from '../../assets/img/wanna/wanna1.png';
import AuthContext from '../../contexts/authContext';
import ThemeContext from '../../contexts/themeContext';
import { userSignInLogOutStart } from '../../redux/login/login.action';
import { getLoginObjDetails } from '../../redux/login/login.selector';

const User = () => {
	const { width } = useWindowSize();
	const { setAsideStatus } = useContext(ThemeContext);
	const { userData, setUser } = useContext(AuthContext);

	const loginData = useSelector(getLoginObjDetails);

	const navigate = useNavigate();
	const handleItem = useNavigationItemHandle();
	const { darkModeStatus, setDarkModeStatus } = useDarkMode();

	const [collapseStatus, setCollapseStatus] = useState<boolean>(false);

	const { t } = useTranslation(['translation', 'menu']);

	return (
		<>
			<div
				className={classNames('user', { open: collapseStatus })}
				role='presentation'
				onClick={() => setCollapseStatus(!collapseStatus)}>
				<div className='user-avatar'>
					{loginData?.userPhoto !== '' && loginData?.userPhoto !== '-' ? (
						<img
							srcSet={loginData?.userPhoto}
							src={loginData?.userPhoto}
							alt='Avatar'
							width={128}
							height={128}
						/>
					) : (
						<img
							srcSet={UserImageWebp}
							src={UserImage}
							alt='Avatar'
							width={128}
							height={128}
						/>
					)}
				</div>
				<div className='user-info'>
					<div className='user-name d-flex align-items-center'>
						{`${loginData?.userName}`}
						<Icon icon='Verified' className='ms-1' color='info' />
					</div>
					<div className='user-sub-title'>{loginData?.userPhoneNumber}</div>
				</div>
			</div>
			<DropdownMenu>
				<DropdownItem>
					<Button
						icon='AccountBox'
						// onClick={() =>
						// 	navigate(
						// 		`../${demoPagesMenu.appointment.subMenu.employeeID.path}/${userData?.id}`,
						// 	)
						// }
					>
						Profile
					</Button>
				</DropdownItem>
				<DropdownItem>
					<Button
						icon={darkModeStatus ? 'DarkMode' : 'LightMode'}
						onClick={() => setDarkModeStatus(!darkModeStatus)}
						aria-label='Toggle fullscreen'>
						{darkModeStatus ? 'Dark Mode' : 'Light Mode'}
					</Button>
				</DropdownItem>
			</DropdownMenu>

			<Collapse isOpen={collapseStatus} className='user-menu'>
				<nav aria-label='aside-bottom-user-menu'>
					<div className='navigation'>
						<div
							role='presentation'
							className='navigation-item cursor-pointer'
							// onClick={() =>
							// 	navigate(
							// 		`../${demoPagesMenu.appointment.subMenu.employeeID.path}/${userData?.id}`,
							// 		// @ts-ignore
							// 		handleItem(),
							// 	)
							// }
						>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon icon='AccountBox' className='navigation-icon' />
									<span className='navigation-text'>
										{t('menu:Profile') as ReactNode}
									</span>
								</span>
							</span>
						</div>
						<div
							role='presentation'
							className='navigation-item cursor-pointer'
							onClick={() => {
								setDarkModeStatus(!darkModeStatus);
								handleItem();
							}}>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon
										icon={darkModeStatus ? 'DarkMode' : 'LightMode'}
										color={darkModeStatus ? 'info' : 'warning'}
										className='navigation-icon'
									/>
									<span className='navigation-text'>
										{darkModeStatus
											? (t('menu:DarkMode') as ReactNode)
											: (t('menu:LightMode') as ReactNode)}
									</span>
								</span>
							</span>
						</div>
					</div>
				</nav>
				<NavigationLine />
				<nav aria-label='aside-bottom-user-menu-2'>
					<div className='navigation'>
						<div
							role='presentation'
							className='navigation-item cursor-pointer'
							onClick={() => {
								if (setUser) {
									setUser('');
								}
								if (width < Number(process.env.REACT_APP_MOBILE_BREAKPOINT_SIZE)) {
									setAsideStatus(false);
								}
								navigate(`../${hidePages.login.path}`);
							}}>
							<span className='navigation-link navigation-link-pill'>
								<span className='navigation-link-info'>
									<Icon icon='Logout' className='navigation-icon' />
									<span className='navigation-text'>
										{t('menu:Logout') as ReactNode}
									</span>
								</span>
							</span>
						</div>
					</div>
				</nav>
			</Collapse>
		</>
	);
};

export default User;
