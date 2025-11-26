import React from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Button } from 'antd';
function Botao() {
    return (
        <>
            <Button type="primary" icon={<SearchOutlined />}>
                Search
            </Button>
        </>
    );
}

export default Botao;
