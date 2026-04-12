"use client";

import { useRouter } from "next/navigation";

import { QuestionAnswerLayout } from "./QuestionAnswerLayout";
import { useQuestionAnswerStore, whoOptions } from "@/entities/question";
import { useTagStore } from "@/entities/tag";
import { ListButton } from "@/shared";

export function WhoStep() {
  const router = useRouter();
  const { who, setWho } = useQuestionAnswerStore();
  const { setWhoTag } = useTagStore();

  const handleSelect = (value: number, label: string, description: string) => {
    setWho(label);
    setWhoTag(label, description);
    router.push("/mainpage/question-answer/5");
  };

  return (
    <QuestionAnswerLayout title={"혼자 식사하시나요\n누구와 함께 하시나요?"}>
      {whoOptions.map(({ label, value, description }) => (
        <ListButton
          key={value}
          onClick={() => handleSelect(value, label, description)}
          isSelected={who === label}
          textSize="base"
        >
          {label}
        </ListButton>
      ))}
    </QuestionAnswerLayout>
  );
}

// ...existing code...
//"use client";

// import React from "react";
// import { useRouter } from "next/navigation";
// import WhoStep from "./ui/WhoStep";
// import { useQuestionAnswerStore } from "@/lib/stores/questionAnswer.store";
// import { useTagStore } from "@/lib/stores/tagData.store";

// export default function WhoStepContainer() {
//   const router = useRouter();
//   const { who, setWho } = useQuestionAnswerStore();
//   const { setWhoTag } = useTagStore();

//   const handleSelect = (value: number, label: string, description: string) => {
//     setWho(value);
//     setWhoTag(label, description);
//     router.push("/mainpage/question-answer/5");
//   };

//   return <WhoStep selectedValue={who} onSelect={handleSelect} />;
// }
//
// ...existing code...
// "use client"; --> 제거 가능 !!

// import React from "react";
// import ListButton from "@/components/common/button/ListButton";
// import QuestionAnswerLayout from "./QuestionAnswerLayout";
// import { whoOptions } from "@/constant/mainpage/Option";

// type Props = {
//   selectedValue?: number;
//   onSelect: (value: number, label: string, description: string) => void;
// };

// const WhoStep = ({ selectedValue, onSelect }: Props) => {
//   return (
//     <QuestionAnswerLayout title={"혼자 식사하시나요\n누구와 함께 하시나요?"}>
//       {whoOptions.map(({ label, value, description }) => (
//         <ListButton
//           key={value}
//           onClick={() => onSelect(value, label, description)}
//           isSelected={selectedValue === value}
//           textSize="base"
//         >
//           {label}
//         </ListButton>
//       ))}
//     </QuestionAnswerLayout>
//   );
// };

// export default WhoStep;
