import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';

const PROJECT_NAME = 'Qn Chrome Tabs';
const TitleContext = createContext<(pageTitle: string) => void>(() => {});

interface DocsTitleProviderProps {
  children: ReactNode;
  embedded: boolean;
  onTitleChange?: (title: string) => void;
}

export function DocsTitleProvider({
  children,
  embedded,
  onTitleChange,
}: DocsTitleProviderProps) {
  const updateTitle = useCallback((pageTitle: string) => {
    const title = `${pageTitle} | ${PROJECT_NAME}`;
    if (!embedded) document.title = title;
    onTitleChange?.(title);
  }, [embedded, onTitleChange]);

  const value = useMemo(() => updateTitle, [updateTitle]);

  return (
    <TitleContext value={value}>
      {children}
    </TitleContext>
  );
}

export function useDocsTitle(pageTitle: string) {
  const updateTitle = useContext(TitleContext);

  useEffect(() => {
    updateTitle(pageTitle);
  }, [pageTitle, updateTitle]);
}
