import React from 'react';
import Modal, { ModalBody, ModalHeader, ModalTitle } from '../bootstrap/Modal';
import Button from '../bootstrap/Button';

interface FilePreviewModalProps {
	src: string;
	onClose: () => void;
	title?: string;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ src, onClose, title }) => {
	const isPdf = src.toLowerCase().split('?')[0].endsWith('.pdf') || src.startsWith('data:application/pdf');

	return (
		<Modal isOpen setIsOpen={onClose} size='lg' isScrollable titleId='file-preview-modal-title'>
			<ModalHeader setIsOpen={onClose}>
				<ModalTitle id='file-preview-modal-title'>{title || 'Preview'}</ModalTitle>
			</ModalHeader>
			<ModalBody>
				<div className='d-flex justify-content-end mb-3'>
					<Button color='secondary' isOutline onClick={onClose}>
						Close
					</Button>
				</div>
				{isPdf ? (
					<object data={src} type='application/pdf' width='100%' height='600px'>
						<p>
							PDF preview not supported.{' '}
							<a href={src} target='_blank' rel='noreferrer'>
								Open PDF
							</a>
							.
						</p>
					</object>
				) : (
					<img src={src} alt='preview' style={{ maxWidth: '100%', height: 'auto' }} />
				)}
			</ModalBody>
		</Modal>
	);
};

export default FilePreviewModal;

