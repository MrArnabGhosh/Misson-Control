import React, { useContext, useState } from 'react'
import AuthLayout from '../../components/layouts/AuthLayout'
import {Link, useNavigate} from "react-router-dom"
import Input from '../../components/inputs/Input'
import { validateEmail } from '../../utils/helper'
import axiosInstance from '../../utils/axiosInstance'
import { API_PATHS } from '../../utils/apiPaths'
import { UserContext } from '../../context/userContext'
const Login = () => {
    const [email, setemail] = useState("")
    const [password, setpassword] = useState("")
    const [error, seterror] = useState(null)
    const navigate = useNavigate()
  const {updateUser} = useContext(UserContext)
    const handelLogin = async (e)=>{ 
      e.preventDefault()
      if(!validateEmail(email)){
        seterror("Please enter a valid Email address.")
        return
      }
      if(!password){
        seterror("Please Enter the Password.")
        return
      }
      seterror("")

      //login api call
      try {
        const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN,{
          email,
          password,
        })
        const { token,role }=response.data
        if(token){
          localStorage.setItem("token",token)
          updateUser(response.data)
        }
        if(role==="admin"){
          navigate("/admin/dashboard")
        }else{
          navigate("/user/dashboard")
        }
      } catch (error) {
        if(error.response && error.response.data.message){
          seterror(error.response.data.message)
        }else{
          seterror("Something went wrong. Please try again.")
        }
      }
    }
  return (
    <AuthLayout>
      <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center'>
        <h3 className=' text-xl font-semibold text-black'>Welcome Back</h3>
        <p className='text-xs text-slate-700 mt-[5px] mb-6'>Please enter your details to login</p>

        <form onSubmit={handelLogin}>
          <Input
            value={email}
            onChange={({target})=>setemail(target.value)}
            label="Email Address"
            placeholder ="arnab@example.com"
            type="text"
          />
          <Input
            value={password}
            onChange={({target})=>setpassword(target.value)}
            label="Password"
            placeholder ="Min 8 characters"
            type="password"
          />
          {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

          <button type="submit" className='btn-primary'>Login</button>

          <p className='text-[13px] text-slate-800 mt-3'>Don't have an account?{" "}

            <Link className="font-medium text-primary underline" to="/signup">SignUp</Link>
          </p>
        </form>

      </div>
    </AuthLayout>
  )
}

export default Login