import type { ReactNode } from "react";

export function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="w-full max-w-md rounded-2xl border border-green-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-sm text-zinc-600">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return <span className="text-sm font-medium text-green-900">{children}</span>;
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "mt-1 w-full rounded-md border border-green-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm",
        "placeholder:text-zinc-400 focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={[
        "mt-1 w-full rounded-md border border-green-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm",
        "focus:border-green-600 focus:outline-none focus:ring-2 focus:ring-green-600/20",
        props.className ?? "",
      ].join(" ")}
    />
  );
}

export function Button({
  children,
  disabled,
  ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...rest}
      disabled={disabled}
      className={[
        "inline-flex h-10 items-center justify-center rounded-md bg-green-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-green-700",
        "disabled:cursor-not-allowed disabled:opacity-60",
        rest.className ?? "",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
      {children}
    </div>
  );
}

