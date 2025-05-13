import ProfileTop from "@/components/profile/ProfileTop";
import RoundedButton from "@/components/ui/RoundedButton";

const profile = () => {
  return (
    <>
      <ProfileTop />
      <RoundedButton
        text="Button"
        color="bg-app-3"
        borderRadius="rounded-2xl"
        isX={true}
      />
    </>
  );
};

export default profile;
