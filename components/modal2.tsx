"use client";
import React from "react";
import {
  Modal as M,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Divider,
} from "@heroui/react";
import { Button } from "./Button";

interface ModalProps {
  children?: any;
  title: string;
  sizeModal?:
    | "md"
    | "sm"
    | "lg"
    | "xl"
    | "2xl"
    | "xs"
    | "3xl"
    | "4xl"
    | "5xl"
    | "full";
  isOpen: boolean;
  onOpenChange: any;
  btnActionTitle: string;
  submit?: any;
  loading?: boolean;
  noAction?: boolean;
}
export default function Modal({
  children,
  title,
  isOpen,
  onOpenChange,
  btnActionTitle,
  submit,
  loading,
  noAction,
  sizeModal,
}: ModalProps) {
  return (
    <>
      <M
        className="m-4"
        isOpen={isOpen}
        placement="center"
        size={sizeModal}
        onOpenChange={onOpenChange}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-xl font-bold text-dark-blue">
                {title}
              </ModalHeader>
              <Divider className="mb-4" />
              <form onSubmit={submit}>
                <ModalBody className="whitespace-pre-wrap">
                  {children}
                </ModalBody>
                <ModalFooter
                  className={`${noAction ? "hidden" : "flex"} mx-auto justify-end border-t border-gray-200 gap-2 mt-4`}
                >
                  <Button
                    radius="sm"
                    size="sm"
                    onPress={onClose}
                    variant="outline"
                  >
                    Close
                  </Button>
                  <Button
                    isLoading={loading}
                    radius="sm"
                    size="sm"
                    type="submit"
                  >
                    {btnActionTitle}
                  </Button>
                </ModalFooter>
              </form>
            </>
          )}
        </ModalContent>
      </M>
    </>
  );
}
