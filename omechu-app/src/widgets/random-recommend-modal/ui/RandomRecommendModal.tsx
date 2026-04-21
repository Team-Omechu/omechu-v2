import Image from "next/image";
import { useRouter } from "next/navigation";

import { useLocationAnswerStore } from "@/entities/location";
import { useGetRandomMenu } from "@/entities/menu";

import { MainLoading } from "@/shared";

type ModalProps = {
  confirmText: string;
  retryText: string;
  onClose: () => void;
};
export function RandomRecommendModal({
  confirmText,
  retryText,
  onClose,
}: ModalProps) {
  const router = useRouter();
  const { data, isLoading, isRefetching, refetch } = useGetRandomMenu();

  const menu = data;
  const { setKeyword } = useLocationAnswerStore();

  const handleConfirm = () => {
    if (!menu) {
      refetch();
      return;
    }
    setKeyword(menu.name);
    router.push(`/random-recommend/${encodeURIComponent(menu.name)}?record=1`);
  };

  const handleRetry = () => {
    refetch();
  };

  if (isLoading || isRefetching) {
    return <MainLoading />;
  }
  return (
    <div className="relative flex h-[300px] w-[300px] flex-col justify-between rounded-[20px] bg-white p-5 shadow-xl">
      <button className="absolute top-4 right-4" onClick={onClose}>
        <Image src={"/x/close_big.svg"} alt="취소버튼" width={18} height={18} />
      </button>
      <div className="flex flex-col items-center text-center text-[#00A3FF]">
        <span className="text-[19px] font-semibold whitespace-pre-line">
          {menu?.name}
        </span>
      </div>
      <div className="flex flex-col items-center">
        <Image
          src={menu?.image_link || "/image/image_empty.svg"} // menu?.image_link || 추후에 추가
          alt="랜덤추천메뉴"
          width={120}
          height={120}
        />
      </div>
      <div className="flex justify-center gap-4">
        <button
          className="flex-shrik-0 border-grey-dark-hover hover:bg-grey-light-hover active:bg-grey-light-active h-[45px] w-[100px] rounded-md border bg-white text-[15px] font-normal"
          onClick={handleRetry}
        >
          {retryText}
        </button>
        <button
          className="flex-shrik-0 border-grey-dark-hover bg-primary-normal hover:bg-primary-normal-hover active:bg-primary-normal-active h-[45px] w-[100px] rounded-md border text-[15px] font-normal text-white"
          onClick={handleConfirm}
        >
          {confirmText}
        </button>
      </div>
    </div>
  );
}

//랜덤 메뉴 추천하는 것을 props로 받도록 설정해 entities 계층으로 분리
