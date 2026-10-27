import { useMediaQuery } from "./useMediaQuery";

export function useIsMobile() {
  return useMediaQuery("(max-width: 767px)");
}

export function useFinePointer() {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}
