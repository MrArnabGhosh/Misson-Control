import React, {  useEffect, useState } from 'react'
import { useUserAuth } from '../../hooks/useUserAuth'
import { UserContext } from '../../context/userContext'
import DashboardLayout from '../../components/layouts/DashboardLayout'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  useUserAuth()
  const {user} = useContext(UserContext)
  const navigate = useNavigate()

  const [dashboardData, setDashboardData] = useState(null)
  const [pieChartData, setPieChartData] = useState([])
  const [barChartData, setBarChartData] = useState([])

  const getDashboardData = async ()=>{
    try {
      const response = await axiosInstance.get(API_PATHS.TASKS.GET_DASHBOARD_DATA)
      if(response.data){
        setDashboardData(response.data)
      }
    } catch (error) {
      console.error("Error fetching users",error)
    }
  }

  useEffect(() => {
    getDashboardData()
  
    return () => {}
  }, [])
  


  return (
    <DashboardLayout activeMenu="Dashboard">
      <div className="flex">
        <div>
          <div className="flex">
            <h2 className=''> Good Morning {user.name} </h2>
            <p className=''></p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard