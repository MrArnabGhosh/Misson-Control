import React from "react";
import {Routes,Route,BrowserRouter as Router} from "react-router-dom"
import Dashboard from "./pages/Admin/Dashboard"
import Login from "./pages/Auth/Login"
import Signup from "./pages/Auth/Signup"
import ManageTasks from "./pages/Admin/ManageTasks"
import ManageUsers from "./pages/Admin/ManageUsers"
import CreateTask from "./pages/Admin/CreateTask";
import UserDashboard from "./pages/User/UserDashboard";
import MyTasks from "./pages/User/MyTasks";
import ViewTaskDetails from "./pages/User/ViewTaskDetails";
import PrivateRoute from "./routes/PrivateRoute"


const App = () => {
  return <div>
    <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />


          <Route element={<PrivateRoute allowedRoles={["admin"]} />}> 
              <Route path="/admin/dashboard" element={<Dashboard />}/>
              <Route path="/admin/tasks" element={<ManageTasks />}/>
              <Route path="/admin/create-task" element={<CreateTask />}/>
              <Route path="/admin/users" element={<ManageUsers />}/>
          </Route>
  {/* users route */}
          <Route element={<PrivateRoute allowedRoles={["user"]} />}> 
              <Route path="/user/dashboard" element={<UserDashboard />}/>
              <Route path="/user/tasks" element={<MyTasks />}/>
              <Route path="/user/task-details/:id" element={<ViewTaskDetails />}/>
          </Route>


        </Routes>
    </Router>
  </div>;
};

export default App;
