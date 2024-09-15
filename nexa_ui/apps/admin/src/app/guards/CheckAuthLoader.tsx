import { Card, CardContent, CardHeader } from "@nexa_ui/shared";
import Spinner from "../components/Spinner";

export default function CheckAuthLoader() {
    return (
        <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <h1 className="text-xl font-semibold">Checking Authentication Status</h1>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <Spinner />
            </div>
          </CardContent>
        </Card>
      </div>
    )
}