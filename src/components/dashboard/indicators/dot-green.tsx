 

type Props = {
  title: string;
};

export default function DotGreen({ title }: Props) {
  return (
    <span className="flex items-center text-sm font-medium  me-3">
      <span className="flex w-2.5 h-2.5 bg-green-600 rounded-full me-1.5 flex-shrink-0"></span>
      {title}
    </span>
  );
}
