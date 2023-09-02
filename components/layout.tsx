import { Navbar } from "./Navbar"

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Navbar/>
      <main>{children}</main>
    </>
  )
}
