import { Card, CardContent, CardHeader } from '@nexa_ui/shared';
import Spinner from './Spinner';

export  function AuthLoading() {
  return (<div className="flex items-center justify-center min-h-screen bg-gray-900">
    <Card className="w-full max-w-sm">
      <CardHeader>
        <h1 className="text-xl font-semibold">
          Checking Authentication Status
        </h1>
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
