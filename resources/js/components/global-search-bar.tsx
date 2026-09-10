import { router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import {
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
    type CSSProperties,
    type FormEvent,
    type KeyboardEvent,
    type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { index as searchIndex, suggest as searchSuggest } from '@/routes/search';

export type SearchSuggestion = {
    id: string;
    tipo: string;
    tipo_label: string;
    nombre: string;
    detalle: string | null;
    imagen: string | null;
    url: string;
};

type GlobalSearchBarProps = {
    variant?: 'hero' | 'compact';
    className?: string;
    placeholder?: string;
    active?: boolean;
    inputRef?: RefObject<HTMLInputElement | null>;
    onAfterNavigate?: () => void;
    'aria-hidden'?: boolean;
};

type DropdownPosition = {
    top: number;
    left: number;
    width: number;
};

/** Header search sits above hero search and page content. */
const HEADER_SEARCH_DROPDOWN_Z_INDEX = 110;
const HERO_SEARCH_DROPDOWN_Z_INDEX = 60;

const tipoBadgeClass: Record<string, string> = {
    equipo: 'border-0 bg-blue-600 text-white',
    sub_equipo: 'border-0 bg-[#0a7c4a] text-white',
    servicio: 'border-0 bg-orange-600 text-white',
    telefono: 'border-0 bg-purple-600 text-white',
    correo: 'border-0 bg-indigo-600 text-white',
};

function SearchSuggestionsPanel({
    variant,
    isLoading,
    suggestions,
    onSelect,
}: {
    variant: 'hero' | 'compact';
    isLoading: boolean;
    suggestions: SearchSuggestion[];
    onSelect: (url: string) => void;
}) {
    if (isLoading) {
        return (
            <p className="px-4 py-3 text-sm text-muted-foreground">
                Buscando...
            </p>
        );
    }

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <ul className="max-h-80 overflow-y-auto py-1">
            {suggestions.map((suggestion) => (
                <li key={suggestion.id}>
                    <button
                        type="button"
                        onClick={() => onSelect(suggestion.url)}
                        className="flex w-full flex-col items-start gap-2 px-4 py-3 text-left transition hover:bg-muted/60"
                    >
                        <span
                            className={`inline-flex w-fit shrink-0 whitespace-nowrap rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm ${
                                tipoBadgeClass[suggestion.tipo] ??
                                'bg-muted text-foreground'
                            }`}
                        >
                            {suggestion.tipo_label}
                        </span>

                        {variant === 'hero' ? (
                            <div className="flex w-full items-center gap-3">
                                <div className="min-w-0 flex-1">
                                    <p className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                                        {suggestion.nombre}
                                    </p>
                                    {suggestion.detalle && (
                                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                            {suggestion.detalle}
                                        </p>
                                    )}
                                </div>

                                <div className="size-14 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/60">
                                    {suggestion.imagen ? (
                                        <img
                                            src={suggestion.imagen}
                                            alt={suggestion.nombre}
                                            className="size-full object-cover object-center"
                                        />
                                    ) : (
                                        <div className="flex size-full items-center justify-center text-[10px] text-muted-foreground">
                                            Sin imagen
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <>
                                <span className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
                                    {suggestion.nombre}
                                </span>
                                {suggestion.detalle && (
                                    <span className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                        {suggestion.detalle}
                                    </span>
                                )}
                            </>
                        )}
                    </button>
                </li>
            ))}
        </ul>
    );
}

function SearchSuggestionsDropdown({
    variant,
    isLoading,
    suggestions,
    onSelect,
    dropdownRef,
    fixedStyle,
    zIndex,
}: {
    variant: 'hero' | 'compact';
    isLoading: boolean;
    suggestions: SearchSuggestion[];
    onSelect: (url: string) => void;
    dropdownRef?: RefObject<HTMLDivElement | null>;
    fixedStyle: DropdownPosition;
    zIndex: number;
}) {
    if (!isLoading && suggestions.length === 0) {
        return null;
    }

    const panel = (
        <SearchSuggestionsPanel
            variant={variant}
            isLoading={isLoading}
            suggestions={suggestions}
            onSelect={onSelect}
        />
    );

    const shellClassName =
        'overflow-hidden rounded-xl border border-border bg-background shadow-xl';

    return createPortal(
        <div
            ref={dropdownRef}
            data-global-search-dropdown=""
            className={`fixed ${shellClassName}`}
            style={
                {
                    top: `${fixedStyle.top}px`,
                    left: `${fixedStyle.left}px`,
                    width: `${fixedStyle.width}px`,
                    zIndex,
                } satisfies CSSProperties
            }
        >
            {panel}
        </div>,
        document.body,
    );
}

function useDropdownPosition(
    anchorRef: RefObject<HTMLElement | null>,
    active: boolean,
    visible: boolean,
    align: 'left' | 'right',
): DropdownPosition | null {
    const [position, setPosition] = useState<DropdownPosition | null>(null);

    useLayoutEffect(() => {
        if (!active || !visible || !anchorRef.current) {
            setPosition(null);

            return;
        }

        const updatePosition = () => {
            if (!anchorRef.current) {
                return;
            }

            const rect = anchorRef.current.getBoundingClientRect();
            const width =
                align === 'left'
                    ? Math.max(rect.width, 360)
                    : Math.max(rect.width, 288);

            setPosition({
                top: rect.bottom + 8,
                left:
                    align === 'left'
                        ? rect.left
                        : Math.max(8, rect.right - width),
                width,
            });
        };

        updatePosition();

        window.addEventListener('resize', updatePosition);
        window.addEventListener('scroll', updatePosition, true);

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [active, visible, anchorRef, align]);

    return position;
}

export function GlobalSearchBar({
    variant = 'hero',
    className = '',
    placeholder = 'Buscar equipos, servicios, contactos...',
    active = true,
    inputRef,
    onAfterNavigate,
    'aria-hidden': ariaHidden,
}: GlobalSearchBarProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const formRef = useRef<HTMLFormElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const localInputRef = useRef<HTMLInputElement>(null);
    const resolvedInputRef = inputRef ?? localInputRef;

    useEffect(() => {
        if (!active) {
            setSuggestions([]);
            setShowSuggestions(false);

            return;
        }

        const term = searchQuery.trim();

        if (term.length < 2) {
            setSuggestions([]);
            setShowSuggestions(false);

            return;
        }

        const controller = new AbortController();

        const timer = window.setTimeout(async () => {
            setIsLoadingSuggestions(true);

            try {
                const response = await fetch(
                    searchSuggest.url({ query: { q: term } }),
                    {
                        headers: {
                            Accept: 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        },
                        signal: controller.signal,
                    },
                );

                if (!response.ok) {
                    setSuggestions([]);

                    return;
                }

                const data = (await response.json()) as {
                    suggestions?: SearchSuggestion[];
                };

                setSuggestions(data.suggestions ?? []);
                setShowSuggestions(true);
            } catch (error) {
                if (
                    !(error instanceof DOMException && error.name === 'AbortError')
                ) {
                    setSuggestions([]);
                }
            } finally {
                setIsLoadingSuggestions(false);
            }
        }, 300);

        return () => {
            window.clearTimeout(timer);
            controller.abort();
        };
    }, [active, searchQuery]);

    const suggestionsVisible =
        active &&
        showSuggestions &&
        searchQuery.trim().length >= 2 &&
        (isLoadingSuggestions || suggestions.length > 0);

    const dropdownPosition = useDropdownPosition(
        formRef,
        active,
        suggestionsVisible,
        variant === 'hero' ? 'left' : 'right',
    );

    const dropdownZIndex =
        variant === 'hero'
            ? HERO_SEARCH_DROPDOWN_Z_INDEX
            : HEADER_SEARCH_DROPDOWN_Z_INDEX;

    useEffect(() => {
        if (!active || !showSuggestions) {
            return;
        }

        const onPointerDown = (event: MouseEvent) => {
            const target = event.target;

            if (!(target instanceof Node)) {
                return;
            }

            if (containerRef.current?.contains(target)) {
                return;
            }

            if (dropdownRef.current?.contains(target)) {
                return;
            }

            if (
                target instanceof Element &&
                target.closest('[data-global-search-dropdown]')
            ) {
                return;
            }

            setShowSuggestions(false);
        };

        const onKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Escape') {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return () => {
            document.removeEventListener('mousedown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [active, showSuggestions]);

    const navigateTo = (url: string) => {
        router.visit(url);
        setShowSuggestions(false);
        onAfterNavigate?.();
    };

    const openAllResults = () => {
        const term = searchQuery.trim();

        router.get(
            searchIndex.url({
                query: term !== '' ? { q: term } : {},
            }),
        );

        setShowSuggestions(false);
        onAfterNavigate?.();
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        openAllResults();
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (variant === 'hero' && event.key === 'Enter') {
            event.preventDefault();
        }
    };

    if (variant === 'compact') {
        return (
            <>
                <div
                    ref={containerRef}
                    className={`relative ${className}`}
                    aria-hidden={ariaHidden}
                >
                    <form
                        ref={formRef}
                        onSubmit={handleSubmit}
                        className="relative w-full"
                    >
                        <input
                            ref={resolvedInputRef}
                            type="search"
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            onFocus={() => {
                                if (suggestions.length > 0) {
                                    setShowSuggestions(true);
                                }
                            }}
                            placeholder={placeholder}
                            className="h-9 w-full rounded-full border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-[#0a7c4a] focus:ring-2 focus:ring-[#0a7c4a]/20"
                            autoComplete="off"
                        />
                    </form>
                </div>

                {suggestionsVisible && dropdownPosition && (
                    <SearchSuggestionsDropdown
                        variant="compact"
                        isLoading={isLoadingSuggestions}
                        suggestions={suggestions}
                        onSelect={navigateTo}
                        dropdownRef={dropdownRef}
                        fixedStyle={dropdownPosition}
                        zIndex={dropdownZIndex}
                    />
                )}
            </>
        );
    }

    return (
        <>
            <div
                ref={containerRef}
                className={`relative ${className}`}
                aria-hidden={ariaHidden}
            >
                <form
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="flex w-full items-center gap-2 rounded-full border border-border bg-card p-1.5 shadow-lg"
                >
                    <div className="flex min-w-0 flex-1 items-center gap-3 px-4">
                        <Search className="size-4 shrink-0 text-muted-foreground sm:size-5" />
                        <input
                            ref={resolvedInputRef}
                            type="search"
                            value={searchQuery}
                            onChange={(event) =>
                                setSearchQuery(event.target.value)
                            }
                            onKeyDown={handleInputKeyDown}
                            onFocus={() => {
                                if (suggestions.length > 0) {
                                    setShowSuggestions(true);
                                }
                            }}
                            placeholder={placeholder}
                            className="w-full border-0 bg-transparent py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                            autoComplete="off"
                        />
                    </div>
                    <button
                        type="submit"
                        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-sm transition hover:bg-muted"
                        aria-label="Buscar"
                    >
                        <Search className="size-4" />
                    </button>
                </form>
            </div>

            {suggestionsVisible && dropdownPosition && (
                <SearchSuggestionsDropdown
                    variant="hero"
                    isLoading={isLoadingSuggestions}
                    suggestions={suggestions}
                    onSelect={navigateTo}
                    dropdownRef={dropdownRef}
                    fixedStyle={dropdownPosition}
                    zIndex={dropdownZIndex}
                />
            )}
        </>
    );
}
