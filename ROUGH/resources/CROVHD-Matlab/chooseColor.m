%chooseColor.m
%**************************************************************************
function col = chooseColor(num,colorDist)
    [m n] = size(colorDist);
    i=1;
    while i<m
       if num>=colorDist(i,1) && num<colorDist(i,2)
            break
       end
       i=i+1;
    end
   
    col=colorDist(i,3:5);
    if i==m && num>=colorDist(i,1) ,  col=colorDist(i,3:5); end
    
end
%**************************************************************************