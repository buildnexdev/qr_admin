/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable react/react-in-jsx-scope */
import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Badge from '../bootstrap/Badge';
import { TColor } from '../../type/color-type';

/**
 * Prop Types
 * @type {{list: Requireable<(InferPropsInner<Pick<{date: Requireable<object>, badge: Requireable<InferProps<{color: Requireable<string>, text: Requireable<string>}>>, id: Requireable<NonNullable<InferType<Requireable<string>|Requireable<number>>>>, title: Requireable<NonNullable<InferType<Requireable<string>|Requireable<number>>>>, status: Requireable<boolean>}, never>> & Partial<InferPropsInner<Pick<{date: Requireable<object>, badge: Requireable<InferProps<{color: Requireable<string>, text: Requireable<string>}>>, id: Requireable<NonNullable<InferType<Requireable<string>|Requireable<number>>>>, title: Requireable<NonNullable<InferType<Requireable<string>|Requireable<number>>>>, status: Requireable<boolean>}, "date" | "badge" | "id" | "title" | "status">>>)[]>}}
 */
const TodoPropTypes = {
	list: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			logID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			status: PropTypes.bool,
			title: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			// eslint-disable-next-line react/forbid-prop-types
			date: PropTypes.object,
			badge: PropTypes.shape({
				text: PropTypes.string,
				color: PropTypes.oneOf([
					'primary',
					'secondary',
					'success',
					'info',
					'warning',
					'danger',
					'light',
					'dark',
				]),
			}),
		}),
	),
};

export interface ITodoListItem {
	id?: string | number;
	logID?: string | number;
	status?: boolean;
	followUpReason?: string | number;
	assignType?: string | number;
	subTitle?: string | number;
	followUpStaus?: string | number;
	nextFollowupOn?: string | number;
	color?: TColor;
	badge?: {
		text?: string;
		color?: TColor;
	};
}

interface ITodoItemProps {
	list: ITodoListItem[];
	setList(...args: unknown[]): unknown;
	index: number;
}
export const TodoItem = forwardRef<HTMLDivElement, ITodoItemProps>(
	({ index, list, setList, ...props }, ref) => {
		const itemData = list[index];

		return (
			// eslint-disable-next-line react/jsx-props-no-spreading
			<div ref={ref} className={classNames('todo-item')} {...props}>
				<div className='todo-bar'>
					<div
						className={classNames('h-100 w-100', 'rounded', {
							[`bg-${itemData?.color}`]: [`bg-${itemData?.color}`],
						})}
					/>
				</div>
				{/* <div className='todo-check'>
					<Checks
						checked={list[index].status}
						onChange={() => handleChange(index)}
						ariaLabel={itemData.title as string}
					/>
				</div> */}
				<div className='todo-content'>
					<div className='todo-title'>
						{itemData.followUpReason}-(<small>{itemData.assignType}</small>)
					</div>
					{itemData.followUpReason && (
						<div className={`todo-subtitle small text-${itemData.color}`}>
							{/* {dayjs(itemData.date).fromNow()} */}
							{itemData.subTitle}
						</div>
					)}
					{itemData.nextFollowupOn && (
						<div className='todo-subtitle text-danger small'>
							{itemData.nextFollowupOn}
						</div>
					)}
				</div>
				<div className='todo-extras'>
					{itemData?.followUpStaus && (
						<span className='me-2'>
							<Badge isLight color={itemData.color}>
								{itemData.followUpStaus}
							</Badge>
						</span>
					)}
					{/* <span>
						<Dropdown>
							<DropdownToggle hasIcon={false}>
								<Button
									color={themeStatus}
									icon='MoreHoriz'
									aria-label='More options'
								/>
							</DropdownToggle>
							<DropdownMenu isAlignmentEnd>
								<DropdownItem>
									<Button onClick={() => removeTodo(index)} icon='Delete'>
										Delete
									</Button>
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</span> */}
				</div>
			</div>
		);
	},
);
TodoItem.displayName = 'TodoItem';
TodoItem.propTypes = {
	// @ts-ignore
	list: TodoPropTypes.list.isRequired,
	setList: PropTypes.func.isRequired,
	index: PropTypes.number.isRequired,
};
TodoItem.defaultProps = {};

export interface ITodoProps {
	list: ITodoListItem[];
	className?: string;
	setList(...args: unknown[]): unknown;
}
const CustomTodo = forwardRef<HTMLDivElement, ITodoProps>(
	({ className, list, setList, ...props }, ref) => {
		return (
			// eslint-disable-next-line react/jsx-props-no-spreading
			<div ref={ref} className={classNames('todo', className)} {...props}>
				{list.map((i, index) => (
					<TodoItem key={i.logID} index={index} list={list} setList={setList} />
				))}
			</div>
		);
	},
);
CustomTodo.displayName = 'CustomTodo';
CustomTodo.propTypes = {
	className: PropTypes.string,
	// @ts-ignore
	list: TodoPropTypes.list.isRequired,
	setList: PropTypes.func.isRequired,
};
CustomTodo.defaultProps = {
	className: undefined,
};

export default CustomTodo;
