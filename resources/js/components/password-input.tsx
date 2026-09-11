import { Eye, EyeOff, WandSparkles } from 'lucide-react';
import type { ComponentProps, Ref } from 'react';
import { useRef, useState } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const LOWER = 'abcdefghijklmnopqrstuvwxyz';
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DIGITS = '0123456789';
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?';

function secureRandomIndex(max: number): number {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);

    return values[0] % max;
}

function shuffle(chars: string[]): string[] {
    for (let i = chars.length - 1; i > 0; i--) {
        const j = secureRandomIndex(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }

    return chars;
}

export function generateComplexPassword(length = 16): string {
    const pools = [LOWER, UPPER, DIGITS, SYMBOLS];
    const all = pools.join('');
    const chars: string[] = pools.map(
        (pool) => pool[secureRandomIndex(pool.length)],
    );

    while (chars.length < length) {
        chars.push(all[secureRandomIndex(all.length)]);
    }

    return shuffle(chars).join('');
}

function setInputValue(input: HTMLInputElement, value: string): void {
    const prototype = Object.getPrototypeOf(input) as HTMLInputElement;
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
    descriptor?.set?.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
}

export default function PasswordInput({
    className,
    ref,
    generate = false,
    confirmationId,
    ...props
}: Omit<ComponentProps<'input'>, 'type'> & {
    ref?: Ref<HTMLInputElement>;
    generate?: boolean;
    confirmationId?: string;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const localRef = useRef<HTMLInputElement | null>(null);

    const assignRef = (node: HTMLInputElement | null) => {
        localRef.current = node;

        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
    };

    const handleGenerate = () => {
        const password = generateComplexPassword(16);
        const input = localRef.current;

        if (input) {
            setInputValue(input, password);
        }

        if (confirmationId) {
            const confirmation = document.getElementById(
                confirmationId,
            ) as HTMLInputElement | null;

            if (confirmation) {
                setInputValue(confirmation, password);
            }
        }

        setShowPassword(true);
    };

    return (
        <div className="relative">
            <Input
                type={showPassword ? 'text' : 'password'}
                className={cn(generate ? 'pr-20' : 'pr-10', className)}
                ref={assignRef}
                {...props}
            />
            <div className="absolute inset-y-0 right-0 flex items-center">
                {generate ? (
                    <button
                        type="button"
                        onClick={handleGenerate}
                        className="flex h-full items-center px-2 text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none"
                        aria-label="Generar contraseña"
                        title="Generar contraseña de 16 caracteres"
                        tabIndex={-1}
                    >
                        <WandSparkles className="size-4" />
                    </button>
                ) : null}
                <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="flex h-full items-center rounded-r-md px-3 text-muted-foreground hover:text-foreground focus-visible:ring-[3px] focus-visible:ring-ring focus-visible:outline-none"
                    aria-label={
                        showPassword
                            ? 'Ocultar contraseña'
                            : 'Mostrar contraseña'
                    }
                    tabIndex={-1}
                >
                    {showPassword ? (
                        <EyeOff className="size-4" />
                    ) : (
                        <Eye className="size-4" />
                    )}
                </button>
            </div>
        </div>
    );
}
