#!/bin/bash
echo "=== SEARCHING FOR COOKIE SETUP IN LOGIN ==="
echo ""
echo "Looking for cookie setting patterns in login API..."
echo ""

# Search for cookie setting patterns
echo "=== In /api/auth/login ==="
grep -n "cookie\|Cookie\|setHeader\|Set-Cookie" app/api/auth/login/route.ts 2>/dev/null || echo "File not found"

echo ""
echo "=== Common cookie patterns ==="
grep -r "cookies().set\|response.cookies.set\|Set-Cookie" app/api/auth/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -10

echo ""
echo "=== JWT/Token patterns ==="
grep -r "accessToken\|refreshToken\|token.*cookie" app/api/auth/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -10
