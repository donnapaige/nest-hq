import { MemberProfileScreen } from '@/src/screens/Members/MemberProfileScreen';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MemberProfilePage({ params }: Props) {
  const { id } = await params;
  return <MemberProfileScreen memberId={id} />;
}
