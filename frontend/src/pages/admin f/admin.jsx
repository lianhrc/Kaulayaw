// Admin.jsx

import React, { useEffect, useState } from 'react';
import AdminSideSection from './AdminSideSection';
import updateicon from '../img/updateicon.png';
import deleteicon from '../img/deleteicon.png';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [beans, setBeans] = useState([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [inputs, setInputs] = useState({
    coffeename: '',
    coffeecover: '',
    coffeeprice: null,
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAllBeans = async () => {
      try {
        const res = await axios.get('http://localhost:8801/beans');
        setBeans(res.data);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAllBeans();
  }, []);

  const f = new Intl.NumberFormat('en-us', {
    currency: 'PHP',
    style: 'currency',
  });

  const openAddModal = () => {
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
  };

  const openUpdateModal = (bean) => {
    setSelectedItem(bean);
    setInputs({
      coffeename: bean.coffeename,
      coffeecover: bean.coffeecover,
      coffeeprice: bean.coffeeprice,
    });
    setUpdateModalOpen(true);
    setIsUpdateMode(true);
  };

  const closeUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedItem(null);
    setInputs({
      coffeename: '',
      coffeecover: '',
      coffeeprice: null,
    });
    setIsUpdateMode(false);
  };

  const handleChange = (e) => {
    if (e.target.name === 'coffeecover') {
      setInputs((prev) => ({ ...prev, coffeecover: e.target.files[0] }));
    } else {
      setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleAddClick = async () => {
    try {
      const formData = new FormData();
      formData.append('coffeename', inputs.coffeename);
      formData.append('coffeecover', inputs.coffeecover);
      formData.append('coffeeprice', inputs.coffeeprice);

      await axios.post('http://localhost:8801/beans', formData);
      navigate('/admin');
      closeAddModal();
    } catch (error) {
      console.error('Error adding item:', error);
    }
  };

  const handleUpdateClick = async () => {
    try {
      const updatedItem = {
        ...selectedItem,
        coffeename: inputs.coffeename,
        coffeeprice: inputs.coffeeprice,
      };

      if (inputs.coffeecover instanceof File) {
        const formData = new FormData();
        formData.append('coffeename', inputs.coffeename);
        formData.append('coffeecover', inputs.coffeecover);
        formData.append('coffeeprice', inputs.coffeeprice);

        await axios.put(`http://localhost:8801/beans/${selectedItem.coffeeid}`, formData);
      } else {
        await axios.put(`http://localhost:8801/beans/${selectedItem.coffeeid}`, updatedItem);
      }

      setBeans((prevBeans) =>
        prevBeans.map((bean) => (bean.coffeeid === selectedItem.coffeeid ? updatedItem : bean))
      );

      closeUpdateModal();
      setSelectedItem(null);
      setInputs({
        coffeename: '',
        coffeecover: '',
        coffeeprice: null,
      });
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const handleclickDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:8801/beans/${id}`);
      const updatedBeans = beans.filter((bean) => bean.coffeeid !== id);
      setBeans(updatedBeans);
    } catch (error) {
      console.error(error);
    }
  };

  if (!isAdminLoggedIn) {
    return <AdminLogin setIsAdminLoggedIn={setIsAdminLoggedIn} />;
  }

  return (
    <div className='AdminPage'>
      <AdminSideSection />
      <div className='AdminPageContainer'>
        <div id='adminsection1'>
          <div className='section1contentcontainer'>
            <table>
              <thead>
                <tr>
                  <th>Beans id</th>
                  <th>Beans name</th>
                  <th>Beans Price</th>
                  <th>Beans Photo</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {beans.map((bean) => (
                  <tr key={bean.coffeeid}>
                    <td>{bean.coffeeid}</td>
                    <td>{bean.coffeename}</td>
                    <td>{f.format(bean.coffeeprice)}</td>
                    <td>
                      <img src alt={`image of ${bean.coffeename}`} />
                    </td>

                    <td className='actionstd'>
                      <button className='update' onClick={() => openUpdateModal(bean)}>
                        <img src={updateicon} alt='' />
                      </button>
                      {isUpdateModalOpen && (
                        <div className='modal-overlay'>
                          <div className='modal-content'>
                            <span className='close-button' onClick={closeUpdateModal}>
                              &times;
                            </span>
                            <form onSubmit={(e) => e.preventDefault()}>
                              <h2>Update Item</h2>
                              <input
                                className="addinputfield"
                                type="text"
                                placeholder="beans name"
                                value={inputs.coffeename}
                                onChange={handleChange}
                                name="coffeename"
                              />
                              <input
                                className="addinputfield"
                                type="number"
                                placeholder="beans price"
                                value={inputs.coffeeprice}
                                onChange={handleChange}
                                name="coffeeprice"
                              />
                              <input
                                className='addinputfield'
                                type='file'
                                placeholder='beans photo'
                                onChange={(e) =>
                                  setInputs((prev) => ({ ...prev, coffeecover: e.target.files[0] }))
                                }
                                name='coffeecover'
                              />
                              <button className="subbtn" onClick={handleUpdateClick} type="submit">
                                Submit
                              </button>
                            </form>
                          </div>
                        </div>
                      )}
                      <button className='delete' onClick={() => handleclickDelete(bean.coffeeid)}>
                        <img src={deleteicon} alt='' />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={openAddModal} className='Additembtn'>
            Add Item
          </button>
          {isAddModalOpen && (
            <div className='modal-overlay'>
              <div className='modal-content'>
                <span className='close-button' onClick={closeAddModal}>
                  &times;
                </span>
                <form onSubmit={handleAddClick} encType="multipart/form-data">
                  <h2>Add Item</h2>
                  <input
                    className='addinputfield'
                    type='text'
                    placeholder='beans name'
                    onChange={handleChange}
                    name='coffeename'
                  />
                  <input
                    className='addinputfield'
                    type='number'
                    placeholder='beans price'
                    onChange={handleChange}
                    name='coffeeprice'
                  />
                  <input
                    className='addinputfield'
                    type='file'
                    placeholder='beans photo'
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, coffeecover: e.target.files[0] }))
                    }
                    name='coffeecover'
                  />
                  <button className='subbtn' type='submit'>
                    Submit
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>

        <div id='adminsection2'>
          <div className='section2contentcontainer'></div>
        </div>
      </div>
    </div>
  );
};

const AdminLogin = ({ setIsAdminLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await handleAdminLogin({ username, password });
      setIsAdminLoggedIn(true);
    } catch (error) {
      console.error('Error logging in:', error);
    }
  };
  const handleAdminLogin = async (credentials) => {
    // Perform authentication logic here
    // For example, you might make a request to your server to verify the credentials
    try {
      // Replace the following line with your actual authentication logic
      const response = await axios.post('http://localhost:8801/admin_users', credentials);

      // Check if the authentication was successful
      if (response.data.success) {
        // Authentication successful, set isAdminLoggedIn to true
        setIsAdminLoggedIn(true);
      } else {
        // Authentication failed, handle accordingly (e.g., show an error message)
        console.error('Authentication failed:', response.data.message);
      }
    } catch (error) {
      // Handle any errors that occurred during the authentication process
      console.error('Error during authentication:', error);
    }
  };

  return (
    <div className='adminloginpage'>
      <div className="adminlogincontainer">
        
        <div className="adminloginimgcontainer">

        </div>
        
        <input
          type='text'
          placeholder='Username'
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type='password'
          placeholder='Password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
};

export default Admin;
