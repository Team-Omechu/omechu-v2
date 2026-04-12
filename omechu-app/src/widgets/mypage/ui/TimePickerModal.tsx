import { BaseModal } from "@/shared";

type TimePickerModalProps = {
  open: boolean;
  time: string;
  onChangeTime: (time: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onOff?: () => void;
  min?: string;
  max?: string;
};

export function TimePickerModal({
  open,
  time,
  onChangeTime,
  onConfirm,
  onCancel,
  onOff,
  min,
  max,
}: TimePickerModalProps) {
  if (!open) return null;

  return (
    <>
      <BaseModal
        title="알림 시간 정하기"
        isCloseButtonShow={false}
        leftButtonText={onOff ? "알림 끄기" : "취소"}
        rightButtonText="확인"
        onLeftButtonClick={onOff ?? onCancel}
        onRightButtonClick={onConfirm}
      >
        <div className="mt-4 flex w-full justify-center">
          <input
            type="time"
            value={time}
            min={min}
            max={max}
            onChange={(e) => onChangeTime(e.target.value)}
            className="border-font-disabled text-body-2-regular w-2/3 rounded-[10px] border px-5 py-2"
          />
        </div>
      </BaseModal>
    </>
  );
}
