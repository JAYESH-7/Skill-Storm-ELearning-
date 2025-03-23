import React, { useEffect, useState } from "react";
import "./coursedescription.css";
import { useNavigate, useParams } from "react-router-dom";
import { CourseData } from "../../context/CourseContext";
import { server } from "../../main";
import axios from "axios";
import toast from "react-hot-toast";
import { UserData } from "../../context/UserContext";
import Loading from "../../components/loading/Loading";

const CourseDescription = ({ user }) => {
  const params = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const { fetchUser } = UserData();

  const { fetchCourse, course, fetchCourses, fetchMyCourse } = CourseData();

  useEffect(() => {
    fetchCourse(params.id);
  }, []);

  const checkoutHandler = async () => {
    const token = localStorage.getItem("token");
    setLoading(true);

    const {
      data: { order },
    } = await axios.post(
      `${server}/api/course/checkout/${params.id}`,
      {},
      {
        headers: {
          token,
        },
      }
    );

    const options = {
      key: "rzp_test_qlAaqQazCott0K", // Enter the Key ID generated from the Dashboard
      amount: order.id, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
      currency: "INR",
      name: "Skill Storm", //your business name
      description: "Learn with us",
      image: "https://www.bing.com/ck/a?!&&p=9c2b85c21098909d6a7034c7879db94e338b0a17ce26047b17f4fff668df1c0eJmltdHM9MTc0MjY4ODAwMA&ptn=3&ver=2&hsh=4&fclid=032fa7eb-a440-698b-07aa-b6e4a53f684d&u=a1L2ltYWdlcy9zZWFyY2g_cT1TJTIwbmFtZSUyMGxvZ28lMjBsaW5rJkZPUk09SVFGUkJBJmlkPUU3QzA3NzQ5MDhFM0VFODUzQ0ZDNzVBQjdGMTZBNzUxQjY2ODVCNDc&ntb=1",
      order_id: order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1

      handler: async function (response) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
          response;

        try {
          const { data } = await axios.post(
            `${server}/api/verification/${params.id}`,
            {
              razorpay_order_id,
              razorpay_payment_id,
              razorpay_signature,
            },
            {
              headers: {
                token,
              },
            }
          );

          await fetchUser();
          await fetchCourses();
          await fetchMyCourse();
          toast.success(data.message);
          setLoading(false);
          navigate(`/payment-success/${razorpay_payment_id}`);
        } catch (error) {
          toast.error(error.response.data.message);
          setLoading(false);
        }
      },
      theme: {
        color: "#013950",
      },
    };
    const razorpay = new window.Razorpay(options);

    razorpay.open();
  };

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <>
          {course && (
            <div className="course-description">
              <div className="course-header">
                <img
                  src={`${server}/${course.image}`}
                  alt=""
                  className="course-image"
                />
                <div className="course-info">
                  <h2>{course.title}</h2>
                  <p>Instructor: {course.createdBy}</p>
                  <p>Duration: {course.duration} weeks</p>
                </div>
              </div>

              <p>{course.description}</p>

              <p>Let's get started with course At ₹{course.price}</p>

              {user && user.subscription.includes(course._id) ? (
                <button
                  onClick={() => navigate(`/course/study/${course._id}`)}
                  className="common-btn"
                >
                  Study
                </button>
              ) : (
                <button onClick={checkoutHandler} className="common-btn">
                  Buy Now
                </button>
              )}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default CourseDescription;
