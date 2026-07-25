export function cookieParser(req, res, next) {
    const cookieHeader = req.headers.cookie;
    const cookies = {};
    if (cookieHeader) {
        cookieHeader.split(';').forEach((cookie) => {
            const parts = cookie.split('=');
            const name = parts[0].trim();
            const val = parts.slice(1).join('=').trim();
            if (name && val) {
                cookies[name] = decodeURIComponent(val);
            }
        });
    }
    req.cookies = cookies;
    next();
}
