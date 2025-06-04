import React from 'react'
import { Outlet } from 'react-router-dom'

const PrivateRoute = ({allowedRoles}) => {
  return <Outlet>{allowedRoles}</Outlet>
}

export default PrivateRoute