// src/redux/selectors/userSelectors.js
export const selectCurrentUser = state => state.user?.currentUser;
export const selectAuthLoading = state => state.user?.loading;
export const selectAuthError = state => state.user?.error;
export const selectIsAuthenticated = state => Boolean(state.user?.currentUser);
export const selectUserPermissions = state => state.user?.currentUser?.permissions || [];

export const selectHasPermission = (state, permission) => {
    const permissions = selectUserPermissions(state);
    return permissions.includes(permission);
};

export const selectHasAnyPermission = (state, requiredPermissions) => {
    const permissions = selectUserPermissions(state);
    return requiredPermissions.some(permission => permissions.includes(permission));
};

export const selectHasAllPermissions = (state, requiredPermissions) => {
    const permissions = selectUserPermissions(state);
    return requiredPermissions.every(permission => permissions.includes(permission));
};