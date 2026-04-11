import { createBrowserRouter } from "react-router";
import RootLayout from "../RootLayout/RootLayout";
import Home from "../pages/Home/Home";
import NotFoundPage from "../pages/NotFoundPage/NotFoundPage";
import Login from "../pages/Login/Login";
import AddWithdraw from "../pages/AddWithdraw/AddWithdraw";
import AddDeposit from "../pages/AddDeposit/AddDeposit";
import PrivateRoute from "../PrivateRoute/PrivateRoute";
import Profile from "../pages/Profile/Profile";
import CreateAdmin from "../pages/CreateAdmin/CreateAdmin";
import AddPromotion from "../pages/AddPromotion/AddPromotion";
import AllUser from "../pages/AllUser/AllUser";
import AllAffiliateUser from "../pages/AllAffiliateUser/AllAffiliateUser";
import UserDetails from "../pages/UserDetails/UserDetails";
import AffUserDetails from "../pages/AffUserDetails/AffUserDetails";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: (
      <PrivateRoute permKey="dashboard">
        <RootLayout />
      </PrivateRoute>
    ),
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: (
          <PrivateRoute permKey="dashboard">
            <Home />
          </PrivateRoute>
        ),
      },
      {
        path: "profile",
        element: (
          <PrivateRoute permKey="profile">
            <Profile />
          </PrivateRoute>
        ),
      },

      {
        path: "add-withdraw",
        element: (
          <PrivateRoute permKey="add-withdraw">
            <AddWithdraw />
          </PrivateRoute>
        ),
      },
      {
        path: "add-deposit",
        element: (
          <PrivateRoute permKey="add-deposit">
            <AddDeposit />
          </PrivateRoute>
        ),
      },
      {
        path: "create-admin",
        element: (
          <PrivateRoute motherOnly>
            <CreateAdmin />
          </PrivateRoute>
        ),
      },
      {
        path: "add-promotion",
        element: (
          <PrivateRoute permKey="add-promotion">
            <AddPromotion />
          </PrivateRoute>
        ),
      },
      {
        path: "all-user",
        element: (
          <PrivateRoute permKey="all-user">
            <AllUser />
          </PrivateRoute>
        ),
      },
      {
        path: "all-affiliate-user",
        element: (
          <PrivateRoute permKey="all-affiliate-user">
            <AllAffiliateUser />
          </PrivateRoute>
        ),
      },
      {
        path: "/all-user-details/:id",
        element: (
          <PrivateRoute permKey="all-user-details">
            {" "}
            <UserDetails />{" "}
          </PrivateRoute>
        ),
      },
      {
        path: "affiliate-user-details/:id",
        element: (
          <PrivateRoute permKey="affiliate-user-details">
            <AffUserDetails />
          </PrivateRoute>
        ),
      },
    ],
  },
  {
    path: "/login",
    element: <Login />,
  },
]);
