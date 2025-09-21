import { UserSection } from '@/modules/users/ui/sections/user-section';
import { VideosSection } from '@/modules/users/ui/sections/videos-section';

interface UserViewProps {
	userId: string;
}

export const UserView = ({ userId }: UserViewProps) => {
	return (
		<div className='mx-auto mb-10 flex max-w-[1300px] flex-col gap-y-6 px-4 pt-2.5'>
			<UserSection userId={userId} />
			<VideosSection userId={userId} />
		</div>
	);
};
