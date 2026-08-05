import React, { FC, ReactNode, useContext, useRef } from 'react';
import classNames from 'classnames';
import { motion } from 'framer-motion';
import ThemeContext from '../../contexts/themeContext';
import Tooltips from '../../components/bootstrap/Tooltips';
import useAsideTouch from '../../hooks/useAsideTouch';

interface IAsideHeadProps {
	children: ReactNode;
}
export const AsideHead: FC<IAsideHeadProps> = ({ children }) => {
	return <div className='aside-head'>{children}</div>;
};

interface IAsideBodyProps {
	children: ReactNode;
}
export const AsideBody: FC<IAsideBodyProps> = ({ children }) => {
	return <div className='aside-body'>{children}</div>;
};

interface IAsideFootProps {
	children: ReactNode;
}
export const AsideFoot: FC<IAsideFootProps> = ({ children }) => {
	return <div className='aside-foot'>{children}</div>;
};

interface IAsideProps {
	children: any;
}
const Aside: FC<IAsideProps> = ({ children }) => {
	const { asideStatus } = useContext(ThemeContext);

	const { asideStyle, touchStatus, hasTouchButton, asideWidthWithSpace, x } = useAsideTouch();

	const isModernDesign = process.env.REACT_APP_MODERN_DESGIN === 'true';

	const constraintsRef = useRef<HTMLDivElement | null>(null);
	// Framer-motion generics can get inferred as unknown in strict TS; cast once to keep props usable.
	const MotionAside = motion.aside as any;
	const MotionDiv = motion.div as any;

	return (
		<>
			<MotionAside
				style={asideStyle as React.CSSProperties}
				className={classNames(
					'aside',
					{ open: asideStatus },
					{
						'aside-touch-bar': hasTouchButton && isModernDesign,
						'aside-touch-bar-close': !touchStatus && hasTouchButton && isModernDesign,
						'aside-touch-bar-open': touchStatus && hasTouchButton && isModernDesign,
					},
				)}>
				{children}
			</MotionAside>
			{asideStatus && hasTouchButton && isModernDesign && (
				<>
					<MotionDiv className='aside-drag-area' ref={constraintsRef} />
					<Tooltips title='Toggle Aside' flip={['top', 'right']}>
						<MotionDiv
							className='aside-touch'
							drag='x'
							whileDrag={{ scale: 1.2 }}
							whileHover={{ scale: 1.1 }}
							dragConstraints={constraintsRef}
							// onDrag={(event, info) => console.log(info.point.x, info.point.y)}
							dragElastic={0.1}
							style={{ x, zIndex: 1039 }}
							onClick={() => x.set(x.get() === 0 ? asideWidthWithSpace : 0)}
						/>
					</Tooltips>
				</>
			)}
		</>
	);
};

export default Aside;
