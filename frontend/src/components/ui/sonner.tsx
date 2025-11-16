import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--description-text": "var(--muted-foreground)",
        } as React.CSSProperties
      }
      toastOptions={{
        className: "toast",
        descriptionClassName: "text-sm text-muted-foreground opacity-80",
        style: {
          background: "var(--popover)",
          color: "var(--popover-foreground)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          fontSize: "14px",
          lineHeight: "1.4",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
