export function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Unauthorized',
            });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: 'Forbidden: Insufficient permissions',
            });
            return;
        }
        next();
    };
}
