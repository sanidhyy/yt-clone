import Image from 'next/image';

interface VideoThumbnailProps {
	title: string;
	imageUrl?: string | null;
	previewUrl?: string | null;
}

export const VideoThumbnail = ({ title, imageUrl, previewUrl }: VideoThumbnailProps) => {
	return (
		<div className='group relative'>
			{/* Thumbnail wrapper */}
			<div className='relative aspect-video w-full overflow-hidden rounded-xl'>
				<Image
					src={imageUrl || '/placeholder.svg'}
					alt={`Thumbnail of ${title}`}
					fill
					className='size-full object-cover group-hover:opacity-0'
				/>

				<Image
					src={previewUrl || '/placeholder.svg'}
					alt={`Preview of ${title}`}
					fill
					className='size-full object-cover opacity-0 group-hover:opacity-100'
				/>
			</div>

			{/* Video duration box */}
			{/* TODO: Add video duration box */}
		</div>
	);
};
