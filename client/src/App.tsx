import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SupabaseAuthProvider } from "@/contexts/SupabaseAuthContext";
import Account from "@/pages/Account";
import Admin from "@/pages/Admin";
import Auth from "@/pages/Auth";
import Checkout from "@/pages/Checkout";
import Membership from "@/pages/Membership";
import NotFound from "@/pages/NotFound";
import PublicPage from "@/pages/PublicPage";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() { return <Switch><Route path="/" component={Home} /><Route path="/auth" component={Auth} /><Route path="/membership" component={Membership} /><Route path="/checkout" component={Checkout} /><Route path="/free-tips">{() => <PublicPage page="free-tips" />}</Route><Route path="/results">{() => <PublicPage page="results" />}</Route><Route path="/performance">{() => <PublicPage page="performance" />}</Route><Route path="/vip">{() => <PublicPage page="vip" />}</Route><Route path="/about">{() => <PublicPage page="about" />}</Route><Route path="/faq">{() => <PublicPage page="faq" />}</Route><Route path="/contact">{() => <PublicPage page="contact" />}</Route><Route path="/terms">{() => <PublicPage page="terms" />}</Route><Route path="/privacy">{() => <PublicPage page="privacy" />}</Route><Route path="/responsible-use">{() => <PublicPage page="responsible-use" />}</Route><Route path="/account" component={Account} /><Route path="/account/:section" component={Account} /><Route path="/admin" component={Admin} /><Route path="/admin/:section" component={Admin} /><Route path="/404" component={NotFound} /><Route component={NotFound} /></Switch>; }

function App() { return <ErrorBoundary><ThemeProvider defaultTheme="dark"><SupabaseAuthProvider><TooltipProvider><Toaster /><Router /></TooltipProvider></SupabaseAuthProvider></ThemeProvider></ErrorBoundary>; }

export default App;
