import Spinner from "./Spinner";
import { useTheme } from "./theme-provider";

type LoadingProps = {
  message: string;
};
export default function Loading({ message }: LoadingProps) {
    const { theme } = useTheme()
  return (
    <div className={`fixed inset-0 bg-opacity-10 backdrop-blur-0 flex items-center flex-col justify-center z-50 select-none ${ theme === "dark" ? "bg-white": "bg-black"}`}>
        <Spinner />
      <div className={`text-4xl font-bold opacity-35 text-blue-500`}>{message}</div>
    </div>
  );
}
