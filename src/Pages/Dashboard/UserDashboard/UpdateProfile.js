import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { FaPenAlt } from 'react-icons/fa';
import { FiEdit } from 'react-icons/fi';
import { PhotoView } from 'react-photo-view';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useGetUserByEmailQuery, useUserUpdateMutation } from '../../../app/features/auth/authApi';
import demoUser from '../../../asset/image/demoUser.jpg';
import ChangePassword from '../../../component/form/ChangePassword';
import ResetPassword from '../../../component/form/ResetPassword';
import LargeSpinner from '../../../component/spinner/LargeSpinner';
import SmallSpinner from '../../../component/spinner/SmallSpinner';
import { multipartHeaders } from '../../../utils/headers';

const UpdateProfile = () => {
    const { email: paramsEmail } = useParams();
    const [editField, setEditField] = useState({});
    const [previewImage, setPreviewImage] = useState("");
    const [newPassData, setNewPassData] = useState(null)
    const { data, isLoading: isDbLoading, isError, error } = useGetUserByEmailQuery(paramsEmail, { refetchOnMountOrArgChange: true });
    // console.log(data);
    const [updateUser, { isLoading }] = useUserUpdateMutation();
    const handleUpdate = async (event) => {
        event.preventDefault();
        const form = event.target;
        const upData = {
            name: form.name?.value,
            email: form.email?.value,
            phone: form.phone?.value,
            address: form.address?.value,
            country: form.country?.value,
            state: form.state?.value,
            userBio: form.userBio?.value,
        };
        if (form.userImage.files[0]) {
            const formData = new FormData();
            formData.append('image', form.userImage.files[0]);
            try {
                const result = await axios.post(`${process.env.REACT_APP_DEV_URL}/img`,
                    formData,
                    {
                        headers: multipartHeaders
                    })
                if (result.data.file) {
                    updateUser({ ...upData, userImage: result.data.file }).then(res => {
                        if (res.data.success) {
                            toast.success(res.data.message)
                            setEditField({});
                        } else {
                            toast.error(res.data.message)
                        }
                    }).catch(e => console.log(e))
                }
            } catch (error) {
                toast.error(error.message === "Network Error" ? "Please check your internet connection!" : error.message)
            }
        } else {
            updateUser(upData).then(res => {
                if (res.data.success) {
                    toast.success(res.data.message)
                    setEditField({});
                } else {
                    toast.error(res.data.message)
                }
            }).catch(e => console.log(e))
        }
    }
    if (isDbLoading) {
        return <LargeSpinner></LargeSpinner>
    }
    if (isError) {
        if (error.error) {
            return <h4 className='text-center mt-10 md:mt-20'>{error.error}</h4>
        } else {
            return <div className='text-center mt-10 md:mt-52'>
                <p className="text-2xl text-red-500">{error.data.message}</p>
            </div>
        }
    };
    if (!data.success) {
        return <div className='text-center mt-10 md:mt-52'>
            <p className="text-2xl text-red-500">{data.message}</p>
        </div>
    }
    // এই কনস্ট্যান্ট এখানে থাকতে হবে না হলে লোডিং হওয়ার আগের ডাটা রিড করতে গেলে এরর আসবে
    const { email, name, address, country, state, phone, role, userBio, updatedAt, userImage, _id } = data?.data;
    return (
        <div className='max-w-[1100px] xl:max-w-[1500px] mx-auto'>
            <form
                onSubmit={handleUpdate}
            >
                <div className='w-full grid grid-cols-1 mdd:grid-cols-3 gap-2 p-3 mt-0 xl:mt-5'>
                    <div className='col-span-1 bg-gray-200 border rounded-md px-0 xl:px-10'>
                        <div className='text-center relative'>
                            <figure className='pt-4 relative'>
                                <PhotoView src={previewImage || userImage}>
                                    <img className='rounded-full w-[60%] mx-auto border-4 border-blue-500 p-[2px]' src={previewImage || userImage || demoUser} alt="" />
                                </PhotoView>
                                <input
                                    onChange={(e) => setPreviewImage(window.URL.createObjectURL(e.target.files[0]))}
                                    onClick={() => setEditField({ ...editField, upBtn: true })}
                                    type="file"
                                    accept='image/*'
                                    name="userImage"
                                    id="image"
                                    className='hidden'
                                />
                                <label htmlFor="image">
                                    <div className='absolute right-1/4 bottom-2 bg-gray-200 rounded-full z-20 p-2 border border-red-300 hover:bg-green-200 group'><FaPenAlt className='text-gray-600 group-hover:text-gray-700' /></div>
                                </label>
                            </figure>
                            <h2 className='text-2xl mdd:text-xl lg:text-2xl mt-1 font-serif px-1 lg:px-4'>{name}</h2>
                            <h5 className='font-medium text-lg mdd:text-sm lg:text-lg mb-1'>{email}</h5>
                            <h5 className='text-sm mb-1'>Last updated: {new Date(updatedAt).toLocaleString()}</h5>
                            <div className=' bg-blue-300 py-1'>
                                <h4 className='font-semibold text-sm mb-1'>Role: {role}</h4>
                                <h5 className='font-bold text-xs text-gray-500'>UID: {_id}</h5>
                            </div>
                        </div>
                        <hr className='bg-blue-400 h-[2px] mt-4 mx-4' />
                        <div className='mx-4 mt-1'>
                            <h4 className='text-lg'>Bio</h4>
                            <p className='p-2 mb-4 border-black min-h-[60px] rounded-md bg-gray-100'>{userBio}</p>
                        </div>
                    </div>
                    <div className='col-span-2 border rounded-md'>
                        <h3 className='text-xl xl:text-2xl text-green-600  px-0 xl:px-10 my-3 ml-4'>Account Details</h3>
                        <hr />
                        <div className='mx-4 mt-3  px-0 xl:px-10 pb-3'>

                            <div className='grid grid-cols-2 gap-4'>
                                <div className="w-full relative">
                                    <label htmlFor='full-name' className="">Full name</label>
                                    <input
                                        readOnly={!editField.name}
                                        defaultValue={name}
                                        type="text" name='name'
                                        className="w-full text-gray-800 font-medium py-2 pl-3 pr-7 mt-2 border focus:outline-gray-600 border-blue-500 rounded-sm"
                                    />
                                    <p className='absolute top-11 right-2'><FiEdit onClick={() => setEditField({ ...editField, name: true, upBtn: true })} /></p>
                                </div>
                                <div className="w-full relative">
                                    <label htmlFor='phone' className="">Phone</label>
                                    <input
                                        readOnly={!editField.phone}
                                        defaultValue={phone}
                                        type="text" name="phone"
                                        className="w-full text-gray-800 font-medium py-2 pl-3 pr-7 mt-2 border focus:outline-gray-600 border-blue-500 rounded-sm"
                                    />
                                    <p className='absolute top-11 right-2'><FiEdit onClick={() => setEditField({ ...editField, phone: true, upBtn: true })} /></p>
                                </div>
                                <div className="w-full relative">
                                    <label htmlFor='email' className="">Your Email</label>
                                    <input
                                        readOnly={!editField.email}
                                        defaultValue={email}
                                        type="text" name="email"
                                        className="w-full text-gray-800 font-medium py-2 px-3 mt-2 border focus:outline-gray-600 border-blue-500 rounded-sm"
                                    />
                                    {/* <p className='absolute top-11 right-2'><FiEdit onClick={() => setEditField({ ...editField, email: true })} /></p> */}
                                </div>
                                <div className="w-full relative">
                                    <label htmlFor='password' className="">Password</label>
                                    <div
                                        className="w-full text-gray-800 font-medium py-2 pl-3 pr-7 mt-2 border border-blue-500 rounded-sm"
                                    >
                                        <p>Change password</p>
                                    </div>
                                    <p className='absolute top-11 right-2'><FiEdit onClick={() => setNewPassData({ email })} /></p>
                                </div>
                                <div className="w-full col-span-2 relative">
                                    <label htmlFor='address' className="">Address</label>
                                    <input
                                        readOnly={!editField.address}
                                        defaultValue={address}
                                        type="text" name="address"
                                        className="w-full text-gray-800 font-medium py-2 px-3 mt-2 border focus:outline-gray-600 border-blue-500 rounded-sm"
                                    />
                                    <p className='absolute top-11 right-2'><FiEdit onClick={() => setEditField({ ...editField, address: true, upBtn: true })} /></p>
                                </div>
                                <div className="w-full relative">
                                    <label htmlFor='country' className="">County</label>
                                    <input
                                        readOnly={!editField.country}
                                        defaultValue={country}
                                        type="text" name="country"
                                        className="w-full text-gray-800 font-medium py-2 pl-3 pr-7 mt-2 border focus:outline-gray-600 border-blue-500 rounded-sm"
                                    />
                                    <p className='absolute top-11 right-2'><FiEdit onClick={() => setEditField({ ...editField, country: true, upBtn: true })} /></p>
                                </div>
                                <div className="w-full relative">
                                    <label htmlFor='state' className="">State</label>
                                    <input
                                        readOnly={!editField.state}
                                        defaultValue={state}
                                        type="text" name="state"
                                        className="w-full text-gray-800 font-medium py-2 pl-3 pr-7 mt-2 border focus:outline-gray-600 border-blue-500 rounded-sm"
                                    />
                                    <p className='absolute top-11 right-2'><FiEdit onClick={() => setEditField({ ...editField, state: true, upBtn: true })} /></p>
                                </div>
                                <div className="w-full relative col-span-2">
                                    <label htmlFor='' className="">Additional Bio data</label>
                                    <textarea
                                        readOnly={!editField.userBio}
                                        defaultValue={userBio}
                                        type="text" name="userBio"
                                        className="w-full min-h-[100px] text-gray-800 py-2 pl-3 pr-7 mt-2 border focus:outline-gray-600 border-blue-500 rounded-md"
                                    />
                                    <p className='absolute top-11 right-2'><FiEdit onClick={() => setEditField({ ...editField, userBio: true, upBtn: true })} /></p>
                                </div>
                            </div>
                            {editField.upBtn && <div className='flex justify-center'>
                                <div onClick={() => setEditField({})} className='px-8 py-1 mx-auto block mt-3 border border-yellow-400 font-semibold text-yellow-500 select-none rounded-md hover:text-white hover:bg-yellow-400'>Cancel</div>
                                <button disabled={isLoading} type='submit' className='px-8 py-1 w-28 mx-auto block mt-3 bg-blue-700 active:outline outline-green-500 active:text-yellow-400 font-semibold text-white rounded-md hover:bg-blue-800'>{isLoading ? <SmallSpinner /> : "Update"}</button>
                            </div>}

                        </div>
                    </div>
                </div>
            </form>
            {newPassData && <ChangePassword setModalData={setNewPassData} modalData={newPassData}></ChangePassword>}
        </div>
    );
};

export default UpdateProfile;